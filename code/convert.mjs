import { readdir, readFile, writeFile } from "node:fs/promises";
import Path from "path";

import { seedRandom } from "./utils.mjs";
import BaseConversion from "./conversions/base.mjs";
import BackgroundConversion from "./conversions/background.mjs";
import ClassConversion from "./conversions/class.mjs";
import FeatureConversion from "./conversions/feature.mjs";
import LineageConversion from "./conversions/lineage.mjs";
import SpellConversion from "./conversions/spell.mjs";
import SubclassConversion from "./conversions/subclass.mjs";

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
	}
}

async function handleConversion(paths) {
	// No paths specified, load all JSON files in the `_sources` folder
	if ( !paths.length ) {
		const files = await readdir("_sources", { withFileTypes: true });
		for ( const file of files ) {
			if ( !file.isFile() || !file.name.endsWith(".json") ) continue;
			paths.push(Path.join("_sources/", file.name));
		}
	}

	for ( const path of paths ) {
		const file = await readFile(path, { encoding: "utf8" });
		const initial = JSON.parse(file);
		seedRandom(initial._id);
		const Converter = selectConverter(initial);
		const final = Converter.convert(initial);
		const { name } = Path.parse(path);
		await writeFile(Path.join("_converted/", `${name}.json`), `${JSON.stringify(final, null, 2)}\n`, { mode: 0o664 });
	}
}

function selectConverter(data) {
	return {
		"background": BackgroundConversion,
		"class": ClassConversion,
		// consumable => ammunition / consumable
		// container => container
		// equipment => armor / gear
		"feat": FeatureConversion,
		// loot => 
		"race": LineageConversion,
		"spell": SpellConversion,
		"subclass": SubclassConversion,
		// tool => tool
		// weapon => weapon
	}[data.type] ?? BaseConversion;
}
