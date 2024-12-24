import { readdir, readFile, writeFile } from "node:fs/promises";
import Path from "path";

import { determineType } from "../types.mjs";
import { seedRandom } from "../utils.mjs";
import { selectConverter } from "../conversions/_module.mjs";

export default function convertCommand() {
	return {
		command: "convert [files..]",
		describe: "Convert DnD5e content to Black Flag",
		builder: yargs => {
			yargs.positional("files", {
				describe: "Files to convert.",
				type: "string",
				normalize: true
			});
		},
		handler: async argv => handleConversion(argv.files)
	};
}

async function handleConversion(paths) {
	// No paths specified, load all JSON files in the `_sources` folder
	if (!paths.length) {
		const files = await readdir("_sources", { withFileTypes: true });
		for (const file of files) {
			if (!file.isFile() || !file.name.endsWith(".json")) continue;
			paths.push(Path.join("_sources/", file.name));
		}
	}

	let warningShown = false;
	for (const path of paths) {
		const file = await readFile(path, { encoding: "utf8" });
		let initial;
		try {
			initial = JSON.parse(file);
		} catch (err) {
			console.warn("\x1b[31m%s\x1b[0m", `✘ ${path} - Unable to parse json`);
			warningShown = true;
			continue;
		}

		if (!initial?._id || !initial?._key) {
			console.warn("\x1b[31m%s\x1b[0m", `✘ ${path} - No _id nor _key found while attempting to convert`);
			warningShown = true;
			continue;
		}

		seedRandom(initial._id);
		const Converter = selectConverter(determineType(initial._key), initial);
		const final = Converter.convert(initial, null, { context: "cli", path, rootDocument: initial });
		const { name } = Path.parse(path);
		await writeFile(Path.join("_converted/", `${name}.json`), `${JSON.stringify(final, null, 2)}\n`, { mode: 0o664 });

		console.log("\x1b[32m%s\x1b[0m", `✔︎ ${path}`);
	}

	if (warningShown)
		console.warn(
			"\x1b[33m%s\x1b[0m",
			"\nThe command line conversion tool only works with documents extracted using Foundry's CLI tool, " +
				"not exported through the Foundry UI. Use the in-game conversion tool to handle converting through the app."
		);
	console.log("");
}
