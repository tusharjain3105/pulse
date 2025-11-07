import { print } from "esrap";
import tsx from "esrap/languages/tsx";
import { type ArrowFunctionExpression, type Node, parseSync } from "oxc-parser";
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
	log("Parsed AST", JSON.stringify({ fileName, bodyLength: program.length, program }, null, 2));

	const traverse = (nodes: Node[] | Node, path: string[] = []) => {
		if (!Array.isArray(nodes)) {
			nodes = [nodes];
		}

		for (const node of nodes.toReversed()) {
			if (!node?.type) continue;
			const currentPath = [...path, node.type];
			log("Visiting node", { type: node.type, path: currentPath.join(" -> ") });

			switch (node.type) {
				case "JSXExpressionContainer":
					Object.keys(node).forEach((key) => {
						const value = (node as any)[key];

						if (value?.type) {
							switch (value.type as Node["type"]) {
								case "MemberExpression":

								case "CallExpression":

								case "ConditionalExpression":
									log("Wrapping expression", {
										parent: node.type,
										key,
										expressionType: value.type,
									});
									(node as any)[key] = wrapAstNode(
										value,
										"ArrowFunctionExpression",
									);
									log("Wrapped expression", {
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

			Object.keys(node).forEach((key) => {
				const value = (node as any)[key];

				traverse(value, currentPath);
			});
		}
	};

	log("Starting traversal");
	traverse(program, []);
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

const wrapAstNode = (node: Node | Node[], wrapper: Node["type"]) => {
	switch (wrapper) {
		case "ArrowFunctionExpression":
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
