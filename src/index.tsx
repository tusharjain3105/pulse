import { render, state } from "pulse";

const App = () => {
	const value = state(0);

	return (
		<div>
			<Button class="btn" onClick={() => value.value--}>
				Decrement
			</Button>
			<Button class="btn" onClick={() => value.value++}>
				Increment
			</Button>
			<p>{reactive(() => value.value)}</p>
		</div>
	);
};

const Button = (props: any) => {
	return <button {...props} />;
};

render(<App />);
