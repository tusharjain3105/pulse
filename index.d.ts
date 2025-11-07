declare namespace JSX {
	interface IntrinsicElements {
		[elemName: string]: any;
		// etc.
	}

	interface Element extends HTMLElement {}
}
