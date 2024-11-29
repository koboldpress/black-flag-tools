const UUIDFields = {
	ActiveEffect: ["source"],
	Activity: [
		"system.spell.uuid", // CastData
		"system.profiles.*.uuid" // SummonData
	],
	Actor: [],
	Advancement: [
		"configuration.pool.*.uuid" // ChooseFeatures, GrantFeatures, ChooseSpells, GrantSpells
	],
	Item: [
		"system.description.journal", // Class, Subclass, Lineage, Heritage,
		"system.restriction.items.*" // Feature, Talent
	]
};

const HTMLFields = {
	ActiveEffect: ["description"],
	Activity: ["description"]
};

const PACKS = Symbol("packs");

/**
 * Locate all UUIDs in the provided set of documents, optionally remapping them.
 * @param {object[]} documents
 * @param {object} [options={}]
 * @param {Map<string, string>} [options.replacements] - Mapping of original packs to replacement packs.
 * @param {string} [options.type] - Document type being scanned.
 * @returns {Set<string>} - Set of compendiums keys found.
 */
export default function scanUuids(documents, options = {}) {
	const packs = options[PACKS] ?? new Set();
	const replacements = options.replacements;
	const type = options.type ?? documents[0]?._documentType ?? "Item";

	for (const data of documents) {
		// Handle DocumentUUIDFields
		for (const path of UUIDFields[type] ?? []) {
			handleDocumentUUIDField(data, path, packs, replacements);
		}

		// Handle HTMLFields
		for (const path of getHTMLFieldPaths(type, data)) {
			const original = foundry.utils.getProperty(data, path);
			const replaced = original?.replaceAll(/Compendium\.([\w\d\-]+\.[\w\d\-]+)\./g, (match, p1) => {
				packs.add(p1);
				return replacements?.has(p1) ? `Compendium.${replacements.get(p1)}.` : match;
			});
			if (original !== replaced) foundry.utils.setProperty(data, path, replaced);
		}

		// Handle embedded documents
		switch (type) {
			case "Item":
				scanUuids(Object.values(data.system?.activities ?? []), { [PACKS]: packs, replacements, type: "Activity" });
				scanUuids(Object.values(data.system?.advancement ?? []), { [PACKS]: packs, replacements, type: "Advancement" });
				scanUuids(data.effects ?? [], { [PACKS]: packs, replacements, type: "ActiveEffect" });
				break;
			case "Actor":
				scanUuids(data.effects ?? [], { [PACKS]: packs, replacements, type: "ActiveEffect" });
				scanUuids(data.items ?? [], { [PACKS]: packs, replacements, type: "Item" });
				break;
		}
	}

	return packs;
}

function handleDocumentUUIDField(data, path, packs, replacements) {
	if (path.includes("*")) {
		const [part, ...rest] = path.split("*");
		const arr = foundry.utils.getProperty(data, part.replace(/\.$/, ""));
		arr?.forEach(d => handleDocumentUUIDField(d, rest.join("*").replace(/^\./, ""), packs, replacements));
	} else {
		const property = path ? foundry.utils.getProperty(data, path) : data;
		const [, match] = property?.match(/^Compendium\.([\w\d\-]+\.[\w\d\-]+)\./) ?? [];
		if (match) {
			packs.add(match);
			if (replacements?.has(match)) {
				foundry.utils.setProperty(data, path, property.replace(match, replacements.get(match)));
			}
		}
	}
}

function getHTMLFieldPaths(type, data) {
	const paths = Array.from(HTMLFields[type] ?? []);
	if (!["Actor", "Item"].includes(type) || !data.type) return paths;
	let source;
	if (data.type.includes(".")) {
		const [moduleId, moduleType] = data.type.split(".");
		source = game.modules.get(moduleId).documentTypes?.[type]?.[moduleType];
	} else {
		source = game.system.documentTypes?.[type]?.[data.type];
	}
	paths.push(...(source?.htmlFields ?? []).map(s => `system.${s}`));
	return paths;
}
