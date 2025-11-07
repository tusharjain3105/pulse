import { computed, isReactive, isReactiveFunction } from "./state";

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

		// If the value is a function, render it as a computed value
		if (isReactiveFunction(value)) {
			const reactiveValue = computed(value);
			let currentNode = createNode(reactiveValue.value, ele);

			const isTextNode = currentNode instanceof Text;
			const isDocumentFragment = currentNode instanceof DocumentFragment;

			if (isTextNode) {
				reactiveValue.subscribe((value) => {
					currentNode.textContent = String(value);
				});
			} else if (isDocumentFragment) {
				let nodes = Array.from(currentNode.childNodes);
				const commentNode = document.createComment("fragment-start");
				currentNode.insertBefore(commentNode, currentNode.firstChild);
				const endCommentNode = document.createComment("fragment-end");
				currentNode.appendChild(endCommentNode);
				reactiveValue.subscribe((items) => {
					// Remove nodes between comments
					nodes.forEach((node) => node.remove());

					// Replace nodes between comments
					currentNode = createNode(items, ele);
					nodes = Array.from(currentNode.childNodes);
					ele.insertBefore(currentNode, endCommentNode);
				});
			} else {
				// Subscribe to the computed value and replace the current node
				// with the new value when it changes
				reactiveValue.subscribe((value) => {
					try {
						const newNode = createNode(value, ele);
						Object.assign(currentNode, { isMemo: true });
						(<Element>currentNode).replaceWith(newNode);
						currentNode = newNode;
					} catch {
						console.log("Failed to replace computed node:");
						console.log(currentNode);
					}
				});
			}

			return currentNode;
		}

		// If the value is a string or number, render it as a text node
		if (typeof value === "string" || typeof value === "number") {
			return document.createTextNode(value.toString());
		}

		// If the value is an object with a value property, render its value
		if (isReactive(value)) {
			const reactiveValue = value;
			let currentNode = createNode(reactiveValue.value, ele);
			const isTextNode = currentNode instanceof Text;

			if (isTextNode) {
				reactiveValue.subscribe((value) => {
					currentNode.textContent = String(value);
				});
			} else {
				// Subscribe to the reactive value and replace the current node
				// with the new value when it changes
				reactiveValue.subscribe((newValue: any) => {
					try {
						const newNode = createNode(newValue, ele);
						(<Element>currentNode).replaceWith(newNode);
						currentNode = newNode;
					} catch {
						console.log("Failed to replace reactive node:");
						console.log(currentNode);
					}
				});
			}

			return currentNode;
		}

		// If the value is an array, render each element as a node
		if (Array.isArray(value)) {
			const node = fragment;
			const nodes = value.map((child) => createNode(child, ele));

			node.append(...nodes);

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
	ele: {
		addEventListener: (arg0: string, arg1: unknown) => void;
		setAttribute: (arg0: string, arg1: unknown) => void;
	},
	props: { [s: string]: unknown } | ArrayLike<unknown>,
) => {
	Object.entries(props).forEach(([key, value]) => {
		if (isReactiveFunction(value)) {
			value = computed(value);
		}

		if (isReactive(value)) {
			const state = value;
			value = value.value;
			state.subscribe((value) => {
				ele.setAttribute(key, value);
			});
		}

		if (key.startsWith("on")) {
			const eventName = key.slice(2).toLowerCase();

			ele.addEventListener(eventName, value);
		}

		ele.setAttribute(key, value);
	});
};
