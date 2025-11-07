import { state, reactive, computed } from "pulse/state";

interface Todo {
	id: number;
	text: string;
	done: boolean;
}

const todos = state<Todo[]>([
	{ id: 1, text: "Learn Pulse", done: true },
	{ id: 2, text: "Build app", done: false },
]);

const completedCount = computed(() => todos.value.filter((t) => t.done).length);
const totalCount = computed(() => todos.value.length);

export function TodoList() {
	const addTodo = () => {
		const id = Date.now();

		todos.value = [...todos.value, { id, text: `Task ${id}`, done: false }];
	};

	const toggleTodo = (id: number) => {
		todos.value = todos.value.map((todo) =>
			todo.id === id ? { ...todo, done: !todo.done } : todo,
		);
	};

	return (
		<div class="todo-list">
			<h3>
				Array State ({reactive(() => completedCount.value)}/
				{reactive(() => totalCount.value)})
			</h3>
			<ul>
				{reactive(() => Math.random().toFixed(3))}
				{reactive(() =>
					todos.value.map((todo) => (
						<li class={reactive(() => (todo.done ? "done" : ""))}>
							<span>
								{reactive(() => todo.text)}
								{reactive(() => Math.random().toFixed(3))}
							</span>
							<button onClick={() => toggleTodo(todo.id)}>
								{reactive(() => (todo.done ? "Undo" : "Done"))}
							</button>
						</li>
					)),
				)}
			</ul>
			<button onClick={addTodo}>Add Todo</button>
		</div>
	);
}
