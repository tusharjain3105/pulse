import { render, state } from "pulse";

const App = () => {
	const user = state({ name: "John", age: 30 });

	return (
		<div>
			<p>{reactive(() => user.value.name + Math.random().toFixed(2))}</p>
			<p>{reactive(() => user.value.age + Math.random().toFixed(2))}</p>
			<button onClick={() => (user.value.name = "Jane")}>Change Name</button>
			<button onClick={() => (user.value.age = 31)}>Change Age</button>
		</div>
	);
};

render(<App />);
