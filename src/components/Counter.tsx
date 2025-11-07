import { state, computed } from "pulse/state";

const count = state(0);
const isEven = computed(() => count.value % 2 === 0);

export function Counter() {
	return (
		<div class="counter">
			<h3>Basic State</h3>
			<div class="value">{() => count.value}</div>
			<div class="status">Status: {() => (isEven.value ? "Even" : "Odd")}</div>
			<button onClick={() => count.value++}>+</button>
			<button onClick={() => count.value--}>-</button>
		</div>
	);
}
