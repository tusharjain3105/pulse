import { reactive } from "./state";

Object.assign(globalThis, { reactive });

export const render = (element: JSX.Element | (() => JSX.Element)) => {
	const resolvedElement = (
		typeof element === "function" ? element() : element
	) as JSX.Element;

	if (typeof window === "object") {
		document.body.append(resolvedElement);
	}
};
