import { Glob, spawn } from "bun";
import fs from "fs/promises";
import { transformTsx } from "./pulse/transform";

const updateFile = async (filename: string) => {
	const raw = await Bun.file(filename).text();
	try {
		const transformed = transformTsx(raw, filename, {
			development: false,
			tsxToJs: false,
		});

		const formatted = await formatCode(transformed, filename);

		if (raw !== formatted) {
			await Bun.write(filename, formatted);
		}
	} catch (e) {}
};

const formatCode = async (code: string, filePath: string) => {
	const process = Bun.spawn(
		["bunx", "biome", "format", "--stdin-file-path", `./${filePath}`],
		{
			stdin: "pipe",
			stdout: "pipe",
			stderr: "pipe",
		},
	);

	await process.stdin.write(code);
	process.stdin.end();

	let formattedCode = "";
	for await (const chunk of process.stdout) {
		formattedCode += new TextDecoder().decode(chunk);
	}

	let errorOutput = "";
	for await (const chunk of process.stderr) {
		errorOutput += new TextDecoder().decode(chunk);
	}

	return formattedCode;
};

const formatFile = async (filename: string) => {
	spawn(["bunx", "--bun", "biome", "format", "--write", filename]),
		{
			stdin: "pipe",
			stdout: "ignore",
			stderr: "ignore",
		};
};

const glob = new Glob("**/*.tsx");

const watch = async () => {
	for await (const filename of glob.scan()) {
		updateFile(filename);
	}

	const events = fs.watch(".", { recursive: true });

	for await (const { filename, eventType } of events) {
		if (!filename) continue;

		const exists =
			filename && (eventType === "change" || (await fs.exists(filename)));

		if (exists && filename?.endsWith(".tsx")) {
			updateFile(filename);
		} else {
			formatFile(filename);
		}
	}
};

export default watch;
