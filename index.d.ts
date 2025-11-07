declare namespace JSX {
	interface IntrinsicElements {
		[elemName: string]: any;
		// etc.
	}

	interface Element extends HTMLElement {}
}

declare function reactive<T extends Function>(fn: T): T;
