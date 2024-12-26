import { DOCUMENT_TYPES, typeForCollection } from "../types.mjs";

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
		if (foundry.utils.getType(data) !== "Object") continue;

		// Handle DocumentUUIDFields
		for (const path of DOCUMENT_TYPES[type]?.uuidFields ?? []) {
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
		for (const collection of DOCUMENT_TYPES[type]?.embedded ?? []) {
			let d = foundry.utils.getProperty(data, collection);
			if (foundry.utils.getType(d) === "Object") d = Object.values(d);
			if (d) scanUuids(d, { [PACKS]: packs, replacements, type: typeForCollection(collection) });
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
	const paths = Array.from(DOCUMENT_TYPES[type]?.htmlFields ?? []);
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
