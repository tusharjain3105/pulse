process.env.NODE_ENV = "development";

import index from "index.html";
import playground from "playground/index.html";
import { transformTsx } from "./pulse/transform";
import watch from "./watch";

const isDev = process.env.NODE_ENV === "development";

const server = Bun.serve({
	routes: {
		"/": index,
		"/playground": playground,

		"/transform": async (req) => {
			const body = await req.json();
			const input = body.input;
			const result = transformTsx(input);

			return Response.json({ result });
		},
	},

	reusePort: true,

	development: isDev && {
		hmr: true,
		console: true,
		chromeDevToolsAutomaticWorkspaceFolders: false,
	},
});

watch();
console.log(`Server is running at ${server.url}`);
