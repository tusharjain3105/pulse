# Pulse

> Full-stack web framework and developer studio with a native AI developer assistant.

## Overview
Pulse is a Bun-powered full-stack framework and dev studio that natively embeds an LLM agent in its workflow. The framework ships with a TSX-to-JavaScript transform pipeline, a lightweight reactive runtime, and a playground server so developers can iterate rapidly while the agent enforces best practices in real time.

## Features
- **Zero-config dev environment** powered by Bun with hot module reload.
- **TSX transform pipeline** built on `oxc-parser` and `oxc-transform` for fast JSX compilation into Pulse-compatible runtime code.
- **Reactive runtime primitives** (`pulse/state`) providing fine-grained updates for DOM rendering.
- **Integrated playground** that exposes a `/transform` API and renders sample apps via the Pulse runtime.
- **LLM-native foundation** for contextual code suggestions, automated fixes, and project-aware insights across the stack.

## How Pulse Benefits LLM Agents
- **Zero-Config AI Assistance:** Pulse's dev studio features include an AI-powered assistant that understands your application structure, routes, config files, and recent errors, enabling quick, relevant code suggestions and auto-fixes from the moment you start a new project.
- **Native Integration:** AI features such as code generation, error explanations, performance optimization hints, and security suggestions are first-class—no plugins or manual wiring required. The LLM agent leverages the full context of your project and the framework, not just local file context.
- **Full-Stack Coverage:** The AI agent works across the entire tech stack: handling server APIs, database schemas, authentication flows, WebSocket endpoints, front-end components, and even deployment configuration and health checks.
- **Proactive Guidance:** You receive actionable recommendations for SEO, accessibility, performance, security, and architectural patterns as you build, reducing back-and-forth and post-deployment surprises.
- **Developer Experience:** The agent is available in both CLI and interactive studio (UI), making frictionless automation and troubleshooting accessible for any workflow.

## Unique Pulse AI Features
- Contextual code suggestions with auto-completion.
- Error explanations and smart fallbacks for crashes.
- Live performance and health monitoring with AI-powered regression detection.
- Security scanning and automated fixes.
- Project-aware querying—code and architecture suggestions that adapt as your app evolves, not just static linting.
- Typed, production-ready mock data and test suite generation without extra mocking libraries.

## Quick Start
```bash
# Install dependencies
bun install

# Start the dev studio with hot reload
bun run dev

# Run tests
bun test
```

> **Note:** Ensure you have [Bun](https://bun.sh) installed (>= v1.1).

## Scripts
| Command | Description |
| --- | --- |
| `bun run dev` | Launches the Bun server with hot module reload. |
| `bun run start` | Starts the Bun server in development mode. |
| `bun test` | Executes the Bun test suite (see `transform.test.ts`). |

## Project Structure
```
.
├── pulse/                 # Runtime and JSX helpers for DOM rendering
├── src/                   # Example app exercising the runtime
├── playground/            # HTML/TS playground served by Bun
├── transform.ts           # TSX -> Pulse runtime transform pipeline
├── watch.ts               # File watcher for incremental rebuilds
├── build.ts               # Build helpers (TBD)
└── index.ts               # Bun entry point with API routes & HMR
```

## Architecture
1. **Transform layer (`transform.ts`):** Parses TSX via `oxc-parser`, wraps expressions for Pulse reactivity, and optionally emits JavaScript via `oxc-transform`.
2. **Runtime layer (`pulse/`):** Provides signals/state primitives and JSX runtime helpers that translate the transformed code into reactive DOM updates.
3. **Dev server (`index.ts`):** Serves the main app, playground, and `/transform` endpoint while enabling HMR for rapid iteration.
4. **Playground (`playground/` + `src/`):** Demonstrates reactive components and exposes a live editing experience.

> **TODO:** Document the LLM agent API surface once the assistant endpoints are finalized.

## Roadmap
- [x] Bun-based dev server with hot reload and `/transform` API.
- [x] Reactive runtime + JSX renderer for fine-grained DOM updates.
- [ ] AI assistant CLI integration with contextual project graph.
- [ ] Interactive studio UI with agent-assisted editing.
- [ ] Security/performance monitors surfaced through the agent.
- [ ] Deployment orchestration with agent-powered health checks.
- [ ] Built-in database schema and auth templates guided by the agent.

**Progress:** 2/7 complete ✅

## Testing & Quality
- `bun test` runs transformation regression tests (`transform.test.ts`) to validate generated output.
- `bunx biome check .` and `bunx biome format .` keep the codebase linted and formatted.
- **TODO:** Add end-to-end tests for the playground and agent workflows once the UI is available.

## Contributing
1. Fork & clone the repo.
2. Enable Bun (>= v1.1) locally.
3. Create a feature branch and follow Biome formatting before opening a PR.
4. See forthcoming contribution guidelines (**TODO:** add details on agent plugin development).

## Resources & Next Steps
- [Bun Documentation](https://bun.sh/docs)
- [oxc Parser](https://github.com/web-infra-dev/oxc)
- **TODO:** Link to agent API reference and design docs.

Have questions or ideas? Open an issue and tag it with `ai-assistant` to prioritize agent-related enhancements.
