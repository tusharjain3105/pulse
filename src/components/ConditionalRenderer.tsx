import { state, computed } from "pulse/state";

const showDetails = state(false);
const theme = state<"light" | "dark">("light");
const user = state<{ name: string; role: string } | null>(null);
const isLoggedIn = computed(() => user.value !== null);

export function ConditionalRenderer() {
	const login = () => {
		user.value = { name: "Alice", role: "admin" };
	};

	const logout = () => {
		user.value = null;
	};

	return (
		<div class={`conditional theme-${() => theme.value}`}>
			<h3>Conditional Rendering</h3>

			{reactive(() =>
				isLoggedIn.value ? (
					<div class="user-panel">
						<p>Welcome, {reactive(() => user.value!.name)}!</p>
						<p>Role: {reactive(() => user.value!.role)}</p>
						<button onClick={logout}>Logout</button>
					</div>
				) : (
					<button onClick={login}>Login</button>
				),
			)}

			<div class="controls">
				<button onClick={() => (showDetails.value = !showDetails.value)}>
					{reactive(() => (showDetails.value ? "Hide" : "Show"))} Details
				</button>
				<button
					onClick={() =>
						(theme.value = theme.value === "light" ? "dark" : "light")
					}
				>
					Switch to{" "}
					{reactive(() => (theme.value === "light" ? "Dark" : "Light"))}
				</button>
			</div>

			{reactive(() =>
				showDetails.value ? (
					<div class="details">
						<h4>Debug Info</h4>
						<p>Theme: {reactive(() => theme.value)}</p>
						<p>
							Logged in: {reactive(() => (isLoggedIn.value ? "Yes" : "No"))}
						</p>
					</div>
				) : null,
			)}
		</div>
	);
}
