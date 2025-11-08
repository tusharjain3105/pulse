declare namespace JSX {
	interface IntrinsicElements {
		[elemName: string]: any;
		// etc.
	}

	type Element = Node | number | string | null | undefined | Date | State;
}

declare type PulseCSSProperty = Exclude<
	keyof CSSStyleDeclaration,
	"length" | "parentRule"
>;

declare type Props = Record<string, unknown>;

declare type FC<T extends Props = Props> = (props: T) => JSX.Element;

declare function reactive<T extends Function>(fn: T): T;
