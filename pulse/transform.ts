import { print } from "esrap";
import tsx from "esrap/languages/tsx";
import {
	type ArrowFunctionExpression,
	type Node,
	type Expression,
	type Statement,
	parseSync,
} from "oxc-parser";
import { transform } from "oxc-transform";

export function transformTsx(
	input: string,
	fileName: string = "test.tsx",
	opts: { development?: boolean; tsxToJs?: boolean; debug?: boolean } = {},
): string {
	const { development = false, tsxToJs = false, debug = false } = opts;
	const log = (...args: unknown[]) => {
		if (!debug) return;
		console.log("[pulse:transform]", ...args);
	};

	const ast = parseSync(fileName, input, {
		lang: "tsx",
		sourceType: "module",
		astType: "ts",
		showSemanticErrors: true,
		preserveParens: false,
		range: true,
	});

	if (ast.errors.length > 0) {
		throw new Error("Failed to parse file", { cause: ast.errors });
	}

	const program = ast.program.body;
	log(
		"Parsed AST",
		JSON.stringify({ fileName, bodyLength: program.length, program }, null, 2),
	);

	// Base type for all nodes in the AST with parent reference
	type NodeWithParent = (Expression | Statement | Node) & {
		parent?: NodeWithParent;
		callee?: { type: string; name?: string; [key: string]: unknown };
		name?: string;
		type: string;
		[key: string]: unknown;
	};

	const traverse = (
		nodes: NodeWithParent | NodeWithParent[] | undefined,
		path: string[] = [],
		parent?: NodeWithParent,
	) => {
		if (!nodes) return;
		const nodesArray = Array.isArray(nodes) ? nodes : [nodes];
		for (const node of [...nodesArray].reverse()) {
			if (!node?.type) continue;
			const currentPath = [...path, node.type];
			log("Visiting node", { type: node.type, path: currentPath.join(" -> ") });

			switch (node.type) {
				case "JSXExpressionContainer":
					Object.keys(node).forEach((key) => {
						const value = (node as any)[key];

						if (value?.type) {
							switch (value.type as Node["type"]) {
								case "ArrowFunctionExpression":
								case "FunctionExpression":
									// Check if this is an event handler by looking at the parent node
									const parentNode = (node as any).parent;
									if (
										parentNode?.type === "JSXAttribute" &&
										parentNode.name?.name?.match(/^on[A-Z]/)
									) {
										log(`Skipping event handler: ${parentNode.name.name}`);
									} else {
										log("Skipping function/arrow function expression");
									}
									break;

								case "JSXAttribute": {
									const attrName = (value as any).name?.name;
									// Skip event handlers (on*) - we'll handle their contents separately
									if (attrName && attrName.match(/^on[A-Z]/)) {
										log(`Skipping event handler attribute: ${attrName}`);
										break;
									}
									// Continue to process the attribute value
									break;
								}

								case "MemberExpression":
								case "CallExpression":
								case "ConditionalExpression":
									// Skip if already wrapped in reactive()
									if (isReactiveWrapper(value)) {
										log("Skipping already wrapped reactive expression");
										break;
									}

									// Skip if parent is already a reactive wrapper
									if (
										parent?.type === "CallExpression" &&
										parent.callee?.type === "Identifier" &&
										parent.callee.name === "reactive"
									) {
										log("Skipping - inside reactive wrapper");
										break;
									}

									log("Wrapping reactive expression", {
										parent: node.type,
										key,
										expressionType: value.type,
									});

									// Create reactive() wrapper
									const reactiveWrapper = {
										type: "CallExpression",
										callee: {
											type: "Identifier",
											name: "reactive",
										},
										arguments: [
											{
												type: "ArrowFunctionExpression",
												params: [],
												body: value,
												async: false,
												expression: true,
											},
										],
									};

									(node as any)[key] = reactiveWrapper;
									log("Wrapped with reactive()", {
										parent: node.type,
										key,
										expressionType: value.type,
									});
									break;

								default:
							}
						}
					});
					break;
			}

			Object.entries(node).forEach(([key, value]) => {
				// Skip non-object values and special keys
				if (
					value === null ||
					typeof value !== "object" ||
					key === "parent" ||
					key === "loc"
				) {
					return;
				}

				// Set parent reference for the child node
				if (Array.isArray(value)) {
					value.forEach((child) => {
						if (child && typeof child === "object") {
							(child as any).parent = node;
						}
					});
				} else if (value && typeof value === "object") {
					(value as any).parent = node;
				}

				traverse(value as any, currentPath, node);
			});
		}
	};

	log("Starting traversal");
	// Convert program body to NodeWithParent array
	const programNodes = program as unknown as NodeWithParent[];
	traverse(programNodes, []);
	log("Traversal complete");

	const { code } = print(ast.program, tsx({ quotes: "single" }), {
		indent: " ".repeat(2),
	});
	log("Printed TSX", { length: code.length });

	if (!tsxToJs) {
		return code;
	}

	log("Starting TSX -> JS transform", { development });
	const js = transform(fileName, code, {
		jsx: { importSource: "pulse", development },
		assumptions: { setPublicClassFields: true },
		sourceType: "module",
		target: "es2015",
		typescript: { allowNamespaces: true, rewriteImportExtensions: true },
	});
	log("Transform complete", { length: js.code.length });

	return js.code;
}

const isReactiveWrapper = (node: unknown): boolean => {
	if (!node || typeof node !== "object") return false;
	const n = node as {
		type?: string;
		callee?: { type?: string; name?: string };
	};
	return (
		n.type === "CallExpression" &&
		n.callee?.type === "Identifier" &&
		n.callee.name === "reactive"
	);
};

const wrapAstNode = (node: Node, wrapper: Node["type"]) => {
	switch (wrapper) {
		case "ArrowFunctionExpression":
			// Don't wrap if already a reactive wrapper
			if (isReactiveWrapper(node)) {
				return node;
			}
			return {
				type: "ArrowFunctionExpression",
				expression: true,
				async: false,
				params: [],
				body: node,
				id: null,
				generator: false,
				start: 0,
				end: 0,
				range: [0, 0],
			} as ArrowFunctionExpression;
	}
};
