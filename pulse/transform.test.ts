import { expect, test } from "bun:test";
import { transformTsx } from "./transform";

test("basic JSX element with text children", () => {
	const input = `export function App() { return <div>Hello</div>; }`;

	const expected = `var _jsxFileName = "test.tsx";
import { jsxDEV as _jsxDEV } from "pulse/jsx-dev-runtime";
export function App() {
	return /* @__PURE__ */ _jsxDEV("div", { children: "Hello" }, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 2,
		columnNumber: 10
	}, this);
}`;

	expect(
		transformTsx(input, "test.tsx", { development: true, tsxToJs: true }),
	).toInclude(expected);
});

test("JSX with dynamic expression children", () => {
	const input = `export function Counter() { const count = 0; return <span>{count}</span>; }`;

	const expected = `export function Counter() {
	const count = 0;
	return /* @__PURE__ */ _jsxDEV("span", { children: count }, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 4,
		columnNumber: 10
	}, this);
}`;

	expect(
		transformTsx(input, "test.tsx", { development: true, tsxToJs: true }),
	).toInclude(expected);
});

test("JSX with primitive literal children", () => {
	const input = `export function Test() { return <div>{42}</div>; }`;

	const expected = `export function Test() {
	return /* @__PURE__ */ _jsxDEV("div", { children: 42 }, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 2,
		columnNumber: 10
	}, this);
}`;

	expect(
		transformTsx(input, "test.tsx", { development: true, tsxToJs: true }),
	).toInclude(expected);
});

test("JSX with string literal children", () => {
	const input = `export function Test() { return <div>{"hello"}</div>; }`;

	const expected = `export function Test() {
	return /* @__PURE__ */ _jsxDEV("div", { children: "hello" }, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 2,
		columnNumber: 10
	}, this);
}`;

	expect(
		transformTsx(input, "test.tsx", { development: true, tsxToJs: true }),
	).toInclude(expected);
});

test("JSX with boolean literal children", () => {
	const input = `export function Test() { return <div>{true}</div>; }`;

	const expected = `export function Test() {
	return /* @__PURE__ */ _jsxDEV("div", { children: true }, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 2,
		columnNumber: 10
	}, this);
}`;

	expect(
		transformTsx(input, "test.tsx", { development: true, tsxToJs: true }),
	).toInclude(expected);
});

test("JSX with onClick handler", () => {
	const input = `export function Button() { return <button onClick={() => alert("hi")}>Click</button>; }`;

	const expected = `export function Button() {
	return /* @__PURE__ */ _jsxDEV("button", {
		onClick: () => alert("hi"),
		children: "Click"
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 2,
		columnNumber: 10
	}, this);
}`;

	expect(
		transformTsx(input, "test.tsx", { development: true, tsxToJs: true }),
	).toInclude(expected);
});

test("JSX with multiple props", () => {
	const input = `export function Input() { return <input type="text" disabled={true} />; }`;

	const expected = `export function Input() {
	return /* @__PURE__ */ _jsxDEV("input", {
		type: "text",
		disabled: true
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 2,
		columnNumber: 10
	}, this);
}`;

	expect(
		transformTsx(input, "test.tsx", { development: true, tsxToJs: true }),
	).toInclude(expected);
});

test("nested JSX elements", () => {
	const input = `export function Card() { return <div><h1>Title</h1><p>Content</p></div>; }`;

	const expected = `export function Card() {
	return /* @__PURE__ */ _jsxDEV("div", { children: [/* @__PURE__ */ _jsxDEV("h1", { children: "Title" }, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 2,
		columnNumber: 15
	}, this), /* @__PURE__ */ _jsxDEV("p", { children: "Content" }, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 2,
		columnNumber: 29
	}, this)] }, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 2,
		columnNumber: 10
	}, this);
}`;

	expect(
		transformTsx(input, "test.tsx", { development: true, tsxToJs: true }),
	).toInclude(expected);
});

test("JSX with state and increment", () => {
	const input = `import { state } from "pulse"; export function Counter() { const count = state(0); return <button onClick={() => count++}>{count.value}</button>; }`;

	const expected = `import { state } from "pulse";
var _jsxFileName = "test.tsx";
import { jsxDEV as _jsxDEV } from "pulse/jsx-dev-runtime";
export function Counter() {
	const count = state(0);
	return /* @__PURE__ */ _jsxDEV("button", {
		onClick: () => count++,
		children: computed(() => count.value)
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 6,
		columnNumber: 10
	}, this);
}`;

	expect(
		transformTsx(input, "test.tsx", { development: true, tsxToJs: true }),
	).toInclude(expected);
});

test("JSX with conditional rendering", () => {
	const input = `export function Toggle() { const show = true; return <div>{show ? "Visible" : "Hidden"}</div>; }`;

	const expected = `export function Toggle() {
	const show = true;
	return /* @__PURE__ */ _jsxDEV("div", { children: computed(() => show ? "Visible" : "Hidden") }, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 4,
		columnNumber: 10
	}, this);
}`;

	expect(
		transformTsx(input, "test.tsx", { development: true, tsxToJs: true }),
	).toInclude(expected);
});

test("JSX with array map", () => {
	const input = `export function List() { const items = [1,2,3]; return <ul>{items.map(i => i * 2)}</ul>; }`;

	const expected = `export function List() {
	const items = [
		1,
		2,
		3
	];
	return /* @__PURE__ */ _jsxDEV("ul", { children: computed(() => items.map((i) => i * 2)) }, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 4,
		columnNumber: 10
	}, this);
}`;

	expect(
		transformTsx(input, "test.tsx", { development: true, tsxToJs: true }),
	).toInclude(expected);
});

test("JSX with template literal", () => {
	const input = `export function Greeting() { const name = "World"; return <h1>{\`Hello \${name}!\`}</h1>; }`;

	const expected = `export function Greeting() {
	const name = "World";
	return /* @__PURE__ */ _jsxDEV("h1", { children: \`Hello \${name}!\` }, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 4,
		columnNumber: 10
	}, this);
}`;

	expect(
		transformTsx(input, "test.tsx", { development: true, tsxToJs: true }),
	).toInclude(expected);
});

test("JSX with object property access", () => {
	const input = `export function User() { const user = {name: "John"}; return <span>{user.name}</span>; }`;

	const expected = `export function User() {
	const user = { name: "John" };
	return /* @__PURE__ */ _jsxDEV("span", { children: computed(() => user.name) }, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 4,
		columnNumber: 10
	}, this);
}`;

	expect(
		transformTsx(input, "test.tsx", { development: true, tsxToJs: true }),
	).toInclude(expected);
});

test("JSX with function call in children", () => {
	const input = `export function Math() { return <div>{Math.random()}</div>; }`;

	const expected = `export function Math() {
	return /* @__PURE__ */ _jsxDEV("div", { children: computed(() => Math.random()) }, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 2,
		columnNumber: 10
	}, this);
}`;

	expect(
		transformTsx(input, "test.tsx", { development: true, tsxToJs: true }),
	).toInclude(expected);
});

test("JSX with complex expression", () => {
	const input = `export function Complex() { const a = 1, b = 2; return <span>{a + b * 3}</span>; }`;

	const expected = `export function Complex() {
	const a = 1, b = 2;
	return /* @__PURE__ */ _jsxDEV("span", { children: a + b * 3 }, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 4,
		columnNumber: 10
	}, this);
}`;

	expect(
		transformTsx(input, "test.tsx", { development: true, tsxToJs: true }),
	).toInclude(expected);
});

test("JSX with event handler and state update", () => {
	const input = `export function Toggle() { const active = state(false); return <button onClick={() => active.value = !active.value}>{active.value ? "On" : "Off"}</button>; }`;

	const expected = `export function Toggle() {
	const active = state(false);
	return /* @__PURE__ */ _jsxDEV("button", {
		onClick: () => active.value = !active.value,
		children: computed(() => active.value ? "On" : "Off")
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 4,
		columnNumber: 10
	}, this);
}`;

	expect(
		transformTsx(input, "test.tsx", { development: true, tsxToJs: true }),
	).toInclude(expected);
});

test("JSX with className prop", () => {
	const input = `export function Styled() { return <div className="container">Content</div>; }`;

	const expected = `export function Styled() {
	return /* @__PURE__ */ _jsxDEV("div", {
		className: "container",
		children: "Content"
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 2,
		columnNumber: 10
	}, this);
}`;

	expect(
		transformTsx(input, "test.tsx", { development: true, tsxToJs: true }),
	).toInclude(expected);
});

test("JSX with style object", () => {
	const input = `export function Styled() { const style = {color: "red"}; return <div style={style}>Red text</div>; }`;

	const expected = `export function Styled() {
	const style = { color: "red" };
	return /* @__PURE__ */ _jsxDEV("div", {
		style,
		children: "Red text"
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 4,
		columnNumber: 10
	}, this);
}`;

	expect(
		transformTsx(input, "test.tsx", { development: true, tsxToJs: true }),
	).toInclude(expected);
});

test("JSX with data attributes", () => {
	const input = `export function Data() { return <div data-testid="my-div" data-value={42}>Test</div>; }`;

	const expected = `export function Data() {
	return /* @__PURE__ */ _jsxDEV("div", {
		"data-testid": "my-div",
		"data-value": 42,
		children: "Test"
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 2,
		columnNumber: 10
	}, this);
}`;

	expect(
		transformTsx(input, "test.tsx", { development: true, tsxToJs: true }),
	).toInclude(expected);
});

test("JSX with boolean prop shorthand", () => {
	const input = `export function Form() { return <input required disabled />; }`;

	const expected = `export function Form() {
	return /* @__PURE__ */ _jsxDEV("input", {
		required: true,
		disabled: true
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 2,
		columnNumber: 10
	}, this);
}`;

	expect(
		transformTsx(input, "test.tsx", { development: true, tsxToJs: true }),
	).toInclude(expected);
});

test("JSX with spread props", () => {
	const input = `export function Dynamic() { const props = {id: "test"}; return <div {...props}>Content</div>; }`;

	const expected = `export function Dynamic() {
	const props = { id: "test" };
	return /* @__PURE__ */ _jsxDEV("div", _objectSpread(_objectSpread({}, props), {}, { children: "Content" }), void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 4,
		columnNumber: 10
	}, this);
}`;

	expect(
		transformTsx(input, "test.tsx", { development: true, tsxToJs: true }),
	).toInclude(expected);
});

test("JSX with fragment", () => {
	const input = `export function Fragment() { return <>First<span>Second</span></>; }`;

	const expected = `export function Fragment() {
	return /* @__PURE__ */ _jsxDEV(_Fragment, { children: ["First", /* @__PURE__ */ _jsxDEV("span", { children: "Second" }, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 2,
		columnNumber: 17
	}, this)] }, void 0, true);
}`;

	expect(
		transformTsx(input, "test.tsx", { development: true, tsxToJs: true }),
	).toInclude(expected);
});

test("JSX with component composition", () => {
	const input = `export function App() { return <Header><Title>My App</Title></Header>; }`;

	const expected = `export function App() {
	return /* @__PURE__ */ _jsxDEV(Header, { children: /* @__PURE__ */ _jsxDEV(Title, { children: "My App" }, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 2,
		columnNumber: 18
	}, this) }, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 2,
		columnNumber: 10
	}, this);
}`;

	expect(
		transformTsx(input, "test.tsx", { development: true, tsxToJs: true }),
	).toInclude(expected);
});

test("custom component usage", () => {
	const input = `export function App() { return <Button>Click me</Button>; }`;

	const expected = `export function App() {
	return /* @__PURE__ */ _jsxDEV(Button, { children: "Click me" }, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 2,
		columnNumber: 10
	}, this);
}`;

	expect(
		transformTsx(input, "test.tsx", { development: true, tsxToJs: true }),
	).toInclude(expected);
});

test("multiple custom components", () => {
	const input = `export function App() { return <div><Header /><Card title="Hello">Content</Card><Footer /></div>; }`;

	const expected = `export function App() {
	return /* @__PURE__ */ _jsxDEV("div", { children: [
		/* @__PURE__ */ _jsxDEV(Header, {}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 2,
			columnNumber: 15
		}, this),
		/* @__PURE__ */ _jsxDEV(Card, {
			title: "Hello",
			children: "Content"
		}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 2,
			columnNumber: 25
		}, this),
		/* @__PURE__ */ _jsxDEV(Footer, {}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 2,
			columnNumber: 59
		}, this)
	] }, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 2,
		columnNumber: 10
	}, this);
}`;

	expect(
		transformTsx(input, "test.tsx", { development: true, tsxToJs: true }),
	).toInclude(expected);
});

test("nested custom components with props", () => {
	const input = `export function Dashboard() { const user = "John"; return <Layout><Sidebar user={user} /><MainContent><UserProfile name={user} /></MainContent></Layout>; }`;

	const expected = `export function Dashboard() {
	const user = "John";
	return /* @__PURE__ */ _jsxDEV(Layout, { children: [/* @__PURE__ */ _jsxDEV(Sidebar, { user }, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 4,
		columnNumber: 18
	}, this), /* @__PURE__ */ _jsxDEV(MainContent, { children: /* @__PURE__ */ _jsxDEV(UserProfile, { name: user }, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 4,
		columnNumber: 54
	}, this) }, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 4,
		columnNumber: 41
	}, this)] }, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 4,
		columnNumber: 10
	}, this);
}`;

	expect(
		transformTsx(input, "test.tsx", { development: true, tsxToJs: true }),
	).toInclude(expected);
});

test("custom components with state and dynamic children", () => {
	const input = `export function TodoApp() { const todos = state([]); return <TodoList><TodoItem key={1} done={false}>{todos.value.length}</TodoItem></TodoList>; }`;

	const expected = `export function TodoApp() {
	const todos = state([]);
	return /* @__PURE__ */ _jsxDEV(TodoList, { children: /* @__PURE__ */ _jsxDEV(TodoItem, {
		done: false,
		children: computed(() => todos.value.length)
	}, 1, false, {
		fileName: _jsxFileName,
		lineNumber: 4,
		columnNumber: 20
	}, this) }, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 4,
		columnNumber: 10
	}, this);
}`;

	expect(
		transformTsx(input, "test.tsx", { development: true, tsxToJs: true }),
	).toInclude(expected);
});

test("Direct state usage", () => {
	const input = `import { state } from "pulse";
export function Counter() {
  const count = state(0);
  return <button onClick={() => count++}>{count.value}</button>
}`;

	const expected = `import { state } from "pulse";
var _jsxFileName = "test.tsx";
import { jsxDEV as _jsxDEV } from "pulse/jsx-dev-runtime";
export function Counter() {
	const count = state(0);
	return /* @__PURE__ */ _jsxDEV("button", {
		onClick: () => count++,
		children: computed(() => count.value)
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 6,
		columnNumber: 10
	}, this);
}`;

	expect(
		transformTsx(input, "test.tsx", { development: true, tsxToJs: true }),
	).toInclude(expected);
});

test("Direct state usage", () => {
	const input = `<input
	type="text"
	value={count.value}
	onInput={(e) => count.value = (e.target as HTMLInputElement).value}
	placeholder="Name"
/>`;

	const expected = `<input type="text" value={computed(() => count.value)} onInput={(e) => count.value = (e.target as HTMLInputElement).value} placeholder="Name" />`;

	expect(transformTsx(input, "test.tsx")).toInclude(expected);
});
