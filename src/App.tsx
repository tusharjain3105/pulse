import { Counter } from "./components/Counter";
import { TodoList } from "./components/TodoList";
import { ConditionalRenderer } from "./components/ConditionalRenderer";
import { NestedState } from "./components/NestedState";
import { RealTimeData } from "./components/RealTimeData";

const styles = `
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #333;
  min-height: 100vh;
}

.app {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  text-align: center;
  color: white;
  margin-bottom: 3rem;
}

.header h1 {
  font-size: 3rem;
  margin: 0 0 1rem 0;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.header p {
  font-size: 1.2rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
}

.counter .value {
  font-size: 4rem;
  font-weight: bold;
  text-align: center;
  color: #667eea;
  margin: 1rem 0;
}

.counter .status {
  text-align: center;
  margin: 1rem 0;
  font-weight: 500;
}

.counter button {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-size: 1.2rem;
  cursor: pointer;
  margin: 0 0.5rem;
  transition: background 0.2s;
}

.counter button:hover {
  background: #5a67d8;
}

.todo-list ul {
  list-style: none;
  padding: 0;
}

.todo-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem;
  margin: 0.5rem 0;
  background: #f7fafc;
  border-radius: 8px;
  transition: all 0.2s;
}

.todo-list li.done {
  background: #c6f6d5;
  text-decoration: line-through;
  opacity: 0.7;
}

.todo-list button {
  background: #48bb78;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
}

.conditional {
  transition: all 0.3s ease;
}

.conditional.theme-dark {
  background: #2d3748;
  color: white;
}

.conditional .user-panel {
  background: #e6fffa;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
}

.conditional .details {
  background: #f0fff4;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.nested-state .profile-card {
  background: #f7fafc;
  padding: 1.5rem;
  border-radius: 8px;
  margin: 1rem 0;
}

.nested-state input {
  padding: 0.8rem;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  margin-right: 0.5rem;
  font-size: 1rem;
}

.realtime-data .status-indicator {
  font-weight: bold;
  font-size: 1.2rem;
  margin: 1rem 0;
}

.realtime-data .metrics {
  margin: 1.5rem 0;
}

.realtime-data .metric {
  display: flex;
  align-items: center;
  margin: 0.8rem 0;
  gap: 1rem;
}

.realtime-data .bar {
  flex: 1;
  height: 20px;
  background: #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
}

.realtime-data .fill {
  height: 100%;
  background: #48bb78;
  transition: width 0.3s ease;
}

button {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  margin: 0.2rem;
  transition: background 0.2s;
}

button:hover {
  background: #5a67d8;
}

h3 {
  color: #667eea;
  margin-top: 0;
  font-size: 1.5rem;
}
`;

export default function App() {
	return (
		<div class="app">
			<style>{styles}</style>

			<header class="header">
				<h1>Pulse State Management</h1>
				<p>
					Comprehensive showcase of Pulse's reactive state system featuring
					fine-grained updates, computed values, array operations, conditional
					rendering, and real-time data streams.
				</p>
			</header>

			<div class="grid">
				<div class="card">
					<Counter />
				</div>

				<div class="card">
					<TodoList />
				</div>

				<div class="card">
					<ConditionalRenderer />
				</div>

				<div class="card">
					<NestedState />
				</div>

				<div class="card">
					<RealTimeData />
				</div>
			</div>
		</div>
	);
}
