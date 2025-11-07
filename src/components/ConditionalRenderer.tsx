import { computed, state } from "pulse/state";

const showDetails = state(false);
const theme = state<"light" | "dark">("light");
const user = state<{ name: string; role: string } | null>(null);
const isLoggedIn = computed(() => user.value !== null);

export function ConditionalRenderer() {
	const login = () => {
		user.value = { name: "Alice", role: "admin" };
	};

	user.value = { name: "Test user", role: "admin" };

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

			<div style="padding: 10px; background: #f5f5f5; border-radius: 0.5rem; margin-top:0.5rem;">
				<div>Element to Text Change</div>
				{reactive(() =>
					showDetails.value ? (
						<div class="details">
							<h4>Debug Info {reactive(() => Math.random().toFixed(3))}</h4>
							<p>Theme: {reactive(() => theme.value)}</p>
							<p>
								Logged in: {reactive(() => (isLoggedIn.value ? "Yes" : "No"))}
							</p>
						</div>
					) : (
						"Hello"
					),
				)}
			</div>

			<div style="padding: 10px; background: #f5f5f5; border-radius: 0.5rem; margin-top:0.5rem;">
				<div>Text to Element Change</div>
				{reactive(() =>
					showDetails.value ? (
						<>Hello</>
					) : (
						<div class="details">
							<h4>Debug Info {reactive(() => Math.random().toFixed(3))}</h4>
							<p>Theme: {reactive(() => theme.value)}</p>
							<p>
								Logged in: {reactive(() => (isLoggedIn.value ? "Yes" : "No"))}
							</p>
						</div>
					),
				)}
			</div>

			<div style="padding: 10px; background: #f5f5f5; border-radius: 0.5rem; margin-top:0.5rem;">
				<div>Test transition</div>
				<div
					style={reactive(() =>
						showDetails.value
							? { width: "200px", color: "green" }
							: { width: "100px", color: "red" },
					)}
				>
					Width Change
				</div>
			</div>
		</div>
	);
}
