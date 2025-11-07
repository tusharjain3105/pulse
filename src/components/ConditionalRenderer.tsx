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

			{() =>
				isLoggedIn.value ? (
					<div class="user-panel">
						<p>Welcome, {() => user.value!.name}!</p>
						<p>Role: {() => user.value!.role}</p>
						<button onClick={logout}>Logout</button>
					</div>
				) : (
					<button onClick={login}>Login</button>
				)
			}

			<div class="controls">
				<button onClick={() => (showDetails.value = !showDetails.value)}>
					{() => (showDetails.value ? "Hide" : "Show")} Details
				</button>
				<button
					onClick={() =>
						(theme.value = theme.value === "light" ? "dark" : "light")
					}
				>
					Switch to {() => (theme.value === "light" ? "Dark" : "Light")}
				</button>
			</div>

			{() =>
				showDetails.value && (
					<div class="details">
						<h4>Debug Info</h4>
						<p>Theme: {() => theme.value}</p>
						<p>Logged in: {() => (isLoggedIn.value ? "Yes" : "No")}</p>
					</div>
				)
			}
		</div>
	);
}
