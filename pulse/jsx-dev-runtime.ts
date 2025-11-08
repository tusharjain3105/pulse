import { computed, isReactiveFunction, isReactiveState } from "./state";

const SYM_RENDER = Symbol("render");
/**
 * jsxDEV is a function that renders a JSX element to the DOM.
 * @param {String|Function} element - The JSX element to render.
 * @param {Object} props - The props to pass to the JSX element.
 * @returns {HTMLElement} The rendered element.
 */
export const jsxDEV = (
	element: (arg0: { [x: string]: any }) => any,
	{ children, ...props }: any,
): HTMLElement => {
	if (!element) {
		return children;
	}

	if (typeof element === "function") {
		return element(props);
	}

	children = Array.isArray(children) ? children : [children];

	const ele = document.createElement(element) as HTMLElement;

	Object.assign(ele, {
		[SYM_RENDER]: () => {
			const newElement = jsxDEV(element, { children, ...props });
			ele.replaceWith(newElement);
		},
	});

	handleProps(ele, props);
	children.forEach((child: any) => {
		renderElement(child, ele);
	});

	return ele;
};

/**
 * Renders a JSX element to the given element.
 * @param {any} child - The JSX element to render.
 * @param {HTMLElement} ele - The element to render the child to.
 */
const renderElement = (child: any, ele: HTMLElement) => {
	const node = createNode(child, ele);
	ele.appendChild(node);
};

/**
 * Creates a DOM node from a given value.
 * @param {any} value - The value to render to a DOM node.
 * @param {HTMLElement} ele - The element to render the node to.
 * @returns {Node} The created DOM node.
 */
const createNode = (value: any, ele: HTMLElement): Node => {
	const fragment = document.createDocumentFragment();

	try {
		// If the value is an element, return it as is
		if (value instanceof Element) {
			return value;
		}

		// Replace stringable values with text nodes
		if (isStringable(value)) {
			return document.createTextNode(String(value));
		}

		// If the value is a reactive function, render it as a computed value
		if (isReactiveFunction(value)) {
			const reactiveValue = computed(value);

			let currentNode = createNode(reactiveValue.value, ele);

			if (reactiveValue.isReactive) {
				reactiveValue.subscribe((value, oldValue) => {
					currentNode = replaceNodes(oldValue, value, currentNode, ele);
				});
			}

			return currentNode;
		}

		// If the value is an array, render each element as a node
		if (Array.isArray(value)) {
			const node = fragment;
			const startCommentNode = document.createComment("list-start");
			const endCommentNode = document.createComment("list-end");
			const nodes = value.map((child) => createNode(child, ele));

			node.append(startCommentNode, ...nodes, endCommentNode);
			return node;
		}

		// If the value is null or undefined, render an empty fragment
		if (!value) {
			return fragment;
		}

		// If the value is of an unhandled type, log a warning and render an empty fragment
		console.log("Unhandled element", value);

		return fragment;
	} catch (e) {
		// If there is an error rendering the value, log the error and render an empty fragment
		console.log("Failed to render", value, e.message);

		return fragment;
	}
};

/**
 * Handles props for a JSX element.
 * @param {HTMLElement} ele - The element to set props on.
 * @param {Object|ArrayLike<unknown>} props - The props to set on the element. If an object, the keys are the prop names and the values are the prop values. If an array, the props are assumed to be in the format of [key, value].
 */
const handleProps = (
	ele: HTMLElement,
	props: { [s: string]: unknown } | ArrayLike<unknown>,
) => {
	Object.entries(props).forEach(([key, value]) => {
		if (value === undefined) {
			ele.setAttribute(key, "");
			return;
		}

		if (isReactiveFunction(value)) {
			value = computed(value);
		}

		if (isReactiveState(value)) {
			const state = value;
			value = value.value;
			state.subscribe((value) => {
				if (key === "style" && typeof value === "object") {
					Object.entries(value).forEach(([key, value]) => {
						ele.style[key] = value;
					});
					return;
				}
				ele.setAttribute(key, String(value));
			});
		}

		if (key === "style" && typeof value === "object") {
			Object.entries(value).forEach(([key, value]) => {
				ele.style[key] = value;
			});
			return;
		}

		if (key.startsWith("on")) {
			const eventName = key.slice(2).toLowerCase();

			ele.addEventListener(
				eventName as keyof HTMLElementEventMap,
				value as EventListener,
			);
			return;
		}

		ele.setAttribute(key, String(value));
	});
};

const isStringable = (value: unknown): value is string | number | Date => {
	return (
		typeof value === "string" ||
		typeof value === "number" ||
		value instanceof Date
	);
};

const replaceNodes = (
	oldValue: unknown,
	newValue: unknown,
	currentNode: Node,
	parent: Node,
): Node => {
	if (oldValue === newValue) {
		return currentNode;
	}

	if (
		oldValue instanceof HTMLElement &&
		newValue instanceof HTMLElement &&
		oldValue.outerHTML === newValue.outerHTML
	) {
		return currentNode;
	}

	if (isStringable(oldValue)) {
		oldValue = currentNode;
	}

	if (isStringable(newValue)) {
		newValue = document.createTextNode(String(newValue));
	}

	// If both are text nodes, replace content
	if (oldValue instanceof Text && newValue instanceof Text) {
		// If text content is different, replace
		if (oldValue.textContent !== newValue.textContent) {
			oldValue.textContent = newValue.textContent;
		}
		return currentNode;
	}

	// replace old value array with the fragment
	const alreadyHasComments = Array.isArray(oldValue);
	if (Array.isArray(oldValue)) {
		const endMarker = oldValue[oldValue.length - 1].nextSibling;
		if (endMarker instanceof Comment) {
			oldValue.forEach((child) => child.remove());
			const tempNode = document.createComment("temp");
			endMarker.parentNode?.insertBefore(tempNode, endMarker);
			oldValue = tempNode;
		}
	}

	// If new is an array, wrap it with the document fragment
	if (Array.isArray(newValue)) {
		const startMarker = document.createComment("list-start");
		const endMarker = document.createComment("list-end");
		const elements = alreadyHasComments
			? newValue
			: [startMarker, ...newValue, endMarker];
		const fragment = document.createDocumentFragment();
		fragment.append(...elements);
		newValue = fragment;
	}

	if (
		newValue instanceof HTMLElement ||
		newValue instanceof DocumentFragment ||
		newValue instanceof Text
	) {
		if (oldValue instanceof Node) {
			parent.replaceChild(newValue, oldValue);
			return newValue;
		}
	}

	console.log("Handle updates for", {
		currentNode,
		parent,
		oldValue,
		newValue,
	});

	return currentNode;
};
