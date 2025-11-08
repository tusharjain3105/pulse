declare namespace JSX {
	interface IntrinsicElements {
		[elemName: string]: any;
		// etc.
	}

	type Element =
		| HTMLElement
		| DocumentFragment
		| number
		| string
		| null
		| undefined
		| Date
		| State;
}

declare type PulseCSSProperty = Exclude<
	keyof CSSStyleDeclaration,
	"length" | "parentRule"
>;

declare function reactive<T extends Function>(fn: T): T;
