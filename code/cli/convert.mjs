import { readdir, readFile, writeFile } from "node:fs/promises";
import Path from "path";

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

	for (const path of paths) {
		const file = await readFile(path, { encoding: "utf8" });
		const initial = JSON.parse(file);
		seedRandom(initial._id);
		const Converter = selectConverter(initial);
		const final = Converter.convert(initial);
		const { name } = Path.parse(path);
		await writeFile(Path.join("_converted/", `${name}.json`), `${JSON.stringify(final, null, 2)}\n`, { mode: 0o664 });
	}
}
