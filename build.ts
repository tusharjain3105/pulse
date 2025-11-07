import { Glob } from "bun";
import fs, { rmSync } from "fs";
import { transformTsx } from "./pulse/transform";

const isDev = true;
const tsxGlob = new Glob("src/**/*.{ts,tsx}");
const BUILD_DIR = ".pulse";
const TRANSFORM_DIR = isDev ? BUILD_DIR : "dist";

const scanFiles = () => {
	return Array.from(tsxGlob.scanSync());
};

const processFile = async (file: string) => {
	const startTime = performance.now();

	try {
		const content = await Bun.file(file).text();
		const js = transformTsx(content, file, { tsxToJs: false });
		const outputPath = `${TRANSFORM_DIR}/${file}`;

		await Bun.write(outputPath, js);

		const duration = performance.now() - startTime;

		console.log(`${file} → ${outputPath} (${duration.toFixed(3)}ms)`);

		return { file, success: true, duration };
	} catch (error) {
		const duration = performance.now() - startTime;

		console.error(
			`[ERROR] Failed to process ${file} (${duration.toFixed(3)}ms):`,
			error,
		);

		return { file, success: false, duration, error };
	}
};

const build = async () => {
	console.log("🚀 Starting build process...");
	performance.mark("total-build-start");

	if (fs.existsSync(TRANSFORM_DIR)) {
		fs.rmdirSync(TRANSFORM_DIR, { recursive: true });
	}

	const files = scanFiles();

	console.log(`📁 Found ${files.length} files to process`);

	const startTime = performance.now();
	const results = await Promise.all(files.map(processFile));
	const totalDuration = performance.now() - startTime;
	const successful = results.filter(
		(r: { success: boolean }) => r.success,
	).length;
	const failed = results.length - successful;
	const avgTime =
		results.reduce(
			(sum: number, r: { duration: number }) => sum + r.duration,
			0,
		) / results.length;

	console.log("\n📊 Build Summary:");
	console.log(`✅ ${successful} files processed successfully`);

	if (failed > 0) {
		console.log(`❌ ${failed} files failed to process`);
	}

	console.log(`⏱️  Average time per file: ${avgTime.toFixed(3)}ms`);
	console.log(`⏱️  Total build time: ${totalDuration.toFixed(3)}ms`);

	if (failed > 0) {
		const failedFiles = results
			.filter((r: { success: boolean }) => !r.success)
			.map((r: { file: string }) => r.file);

		console.log("\nFailed files:", failedFiles.join(", "));
		process.exit(1);
	}

	if (!isDev) {
		await Bun.build({
			entrypoints: ["dist/src/index.js"],
			outdir: ".pulse",
			minify: !isDev,
			sourcemap: isDev,
			target: "bun",
			jsx: { development: isDev, importSource: "pulse", sideEffects: true },
		});

		rmSync("dist", { recursive: true });
	}
};

export default build;
