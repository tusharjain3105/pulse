const inputEl = document.getElementById("input") as HTMLTextAreaElement;
const outputEl = document.getElementById("output") as HTMLTextAreaElement;
const convertBtn = document.getElementById("convertBtn") as HTMLButtonElement;
const errorEl = document.getElementById("error") as HTMLDivElement;

const transformTsxToJs = async (tsx: string) => {
	const response = await fetch("/transform", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ input: tsx }),
	});

	const result = await response.json();

	return result.result;
};

convertBtn.onclick = async () => {
	errorEl!.style.display = "none";

	try {
		const input = inputEl.value;
		const result = await transformTsxToJs(input);

		outputEl.value = result;
	} catch (err: any) {
		outputEl.value = "";
		errorEl.textContent = err.toString();
		errorEl.style.display = "block";
	}
};

inputEl.addEventListener("keydown", (e) => {
	if ((e.ctrlKey || e.metaKey) && e.key === "Enter") convertBtn.click();
});
