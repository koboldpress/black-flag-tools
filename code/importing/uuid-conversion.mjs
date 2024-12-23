import { DOCUMENT_TYPES, typeForCollection } from "../types.mjs";

const UUIDFields = {
	ActiveEffect: ["source"],
	Activity: [
		"system.spell.uuid", // CastData
		"system.profiles.*.uuid" // SummonData
	],
	Actor: [],
	Advancement: [
		"configuration.pool.*.key", // Equipment
		"configuration.pool.*.uuid" // ChooseFeatures, GrantFeatures, ChooseSpells, GrantSpells
	],
	Item: [
		"system.description.journal", // Class, Subclass, Lineage, Heritage,
		"system.restriction.items.*" // Feature, Talent
	],
	JournalEntry: [],
	JournalEntryPage: [
		"system.item", // Class, Subclass
		"system.spells", // Spell List
		"system.subclasses" // Class
	]
};

const HTMLFields = {
	ActiveEffect: ["description"],
	Activity: ["description"],
	JournalEntryPage: ["text.content", "text.markdown"]
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
		if (type === "Item") {
			scanUuids(Object.values(data.system?.activities ?? []), { [PACKS]: packs, replacements, type: "Activity" });
			scanUuids(Object.values(data.system?.advancement ?? []), { [PACKS]: packs, replacements, type: "Advancement" });
		}
		for (const collection of DOCUMENT_TYPES[type]?.embedded ?? []) {
			scanUuids(data[collection] ?? [], { [PACKS]: packs, replacements, type: typeForCollection(collection) });
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
		const handle = value => {
			const [, match] = value?.match(/^Compendium\.([\w\d\-]+\.[\w\d\-]+)\./) ?? [];
			if (match) {
				packs.add(match);
				if (replacements?.has(match)) return value.replace(match, replacements.get(match));
			}
			return value;
		};
		if (foundry.utils.getType(property) === "Array") {
			foundry.utils.setProperty(
				data,
				path,
				property.map(p => handle(p))
			);
		} else {
			foundry.utils.setProperty(data, path, handle(property));
		}
	}
}

function getHTMLFieldPaths(type, data) {
	const paths = Array.from(HTMLFields[type] ?? []);
	if (!data.type) return paths;
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
