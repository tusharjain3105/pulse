import { reactive } from "./state";
export * from "./state";
Object.assign(globalThis, { reactive });

export const render = (element: JSX.Element | (() => JSX.Element)) => {
	const resolvedElement = (
		typeof element === "function" ? element() : element
	) as JSX.Element;

	if (typeof window === "object") {
		const node =
			resolvedElement instanceof Node
				? resolvedElement
				: document.createTextNode(String(resolvedElement));
		document.body.append(node);
	}
};
