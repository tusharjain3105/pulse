import { state, reactive, computed } from "pulse/state";

const metrics = state({ cpu: 45, memory: 62, network: 23 });
const isActive = state(false);
const history = state<number[]>([]);

const avgCpu = computed(() =>
	history.value.length > 0
		? (history.value.reduce((a, b) => a + b, 0) / history.value.length).toFixed(
				1,
			)
		: "0",
);

const status = computed(() => {
	const cpu = metrics.value.cpu;

	if (cpu > 80) return { level: "critical", color: "#ef4444" };
	if (cpu > 60) return { level: "warning", color: "#f59e0b" };

	return { level: "normal", color: "#10b981" };
});

let interval: Timer | null = null;

export function RealTimeData() {
	const startMonitoring = () => {
		if (interval) return;

		isActive.value = true;

		interval = setInterval(() => {
			const newCpu = Math.floor(Math.random() * 100);

			metrics.value = {
				...metrics.value,
				cpu: newCpu,
				memory: Math.floor(Math.random() * 100),
				network: Math.floor(Math.random() * 100),
			};

			history.value = [...history.value.slice(-9), newCpu];
		}, 1000);
	};

	const stopMonitoring = () => {
		if (interval) {
			clearInterval(interval);
			interval = null;
		}

		isActive.value = false;
	};

	return (
		<div class="realtime-data">
			<h3>Real-time State Updates</h3>

			<div class="status-indicator" style={`color: ${status.value.color}`}>
				Status: {reactive(() => status.value.level.toUpperCase())}
			</div>

			<div class="metrics">
				<div class="metric">
					<span>CPU</span>
					<div class="bar">
						<div class="fill" style={`width: ${metrics.value.cpu}%`}></div>
					</div>
					<span>{reactive(() => metrics.value.cpu)}%</span>
				</div>

				<div class="metric">
					<span>Memory</span>
					<div class="bar">
						<div class="fill" style={`width: ${metrics.value.memory}%`}></div>
					</div>
					<span>{reactive(() => metrics.value.memory)}%</span>
				</div>

				<div class="metric">
					<span>Network</span>
					<div class="bar">
						<div class="fill" style={`width: ${metrics.value.network}%`}></div>
					</div>
					<span>{reactive(() => metrics.value.network)}%</span>
				</div>
			</div>

			<p>Average CPU (last 10): {reactive(() => avgCpu.value)}%</p>

			<div class="controls">
				{reactive(() =>
					isActive.value ? (
						<button onClick={stopMonitoring}>Stop Monitoring</button>
					) : (
						<button onClick={startMonitoring}>Start Monitoring</button>
					),
				)}
			</div>
		</div>
	);
}
