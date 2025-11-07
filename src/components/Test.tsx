import { state } from "pulse/state";

const Test = () => {
	const count = state("Hello world");

	return (
		<input
			type="text"
			value={reactive(() => count.value)}
			onInput={(e) => (count.value = (e.target as HTMLInputElement).value)}
			placeholder="Name"
		/>
	);
};
