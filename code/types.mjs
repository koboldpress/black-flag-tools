import selectActorConverter from "./conversions/actor/_module.mjs";
import AdventureConversion from "./conversions/adventure/_module.mjs";
import selectItemConverter from "./conversions/item/_module.mjs";
import { default as JournalEntryConversion, selectJournalEntryPageConverter } from "./conversions/journal/_module.mjs";
import SceneConversion from "./conversions/scene/_module.mjs";

/**
 * Determine the type for the provided `_key`.
 * @param {string} key
 * @returns {string|void}
 */
export function determineType(key) {
	const [, type] = key.split("!");
	return typeForCollection(type.split(".").pop());
}

/**
 * Determine what type belongs in the specified collection.
 * @param {string} collection
 * @returns {string|void}
 */
export function typeForCollection(collection) {
	return Object.entries(DOCUMENT_TYPES).find(([, v]) => v.collection === collection)?.[0];
}

/**
 * @typedef {object} DocumentTypeData
 * @property {string} collection
 * @property {boolean} [convertible]
 * @property {string[]} [embedded]
 * @property {string[]} [htmlFields]
 * @property {string[]} [uuidFields]
 */

/**
 * Foundry's built-in types with information needed to build keys.
 * @enum {DocumentTypeData}
 */
export const DOCUMENT_TYPES = {
	ActiveEffect: {
		collection: "effects",
		htmlFields: ["description"],
		uuidFields: ["source"]
	},
	Activity: {
		collection: "system.activities",
		htmlFields: ["description"],
		uuidFields: [
			"system.spell.uuid", // CastData
			"system.profiles.*.uuid" // SummonData
		]
	},
	Actor: {
		collection: "actors",
		convertible: true,
		embedded: ["effects", "items"],
		selectConverter: selectActorConverter
	},
	ActorDelta: {
		embedded: ["effects", "items"]
	},
	Advancement: {
		collection: "system.advancement",
		uuidFields: [
			"configuration.pool.*.key", // Equipment
			"configuration.pool.*.uuid" // ChooseFeatures, GrantFeatures, ChooseSpells, GrantSpells
		]
	},
	Adventure: {
		collection: "adventures",
		convertible: true,
		embedded: ["actors", "combats", "items", "journal", "scenes", "tables", "macros", "cards", "playlists", "folders"],
		selectConverter: () => AdventureConversion
	},
	AmbientLight: {
		collection: "lights"
	},
	AmbientSound: {
		collection: "sounds"
	},
	Cards: {
		collection: "cards",
		embedded: ["cards"]
	},
	Combat: {
		collection: "combats",
		embedded: ["combatants"]
	},
	Combatant: {
		collection: "combatants"
	},
	Drawing: {
		collection: "drawings"
	},
	Folder: {
		collection: "folders"
	},
	Item: {
		collection: "items",
		convertible: true,
		embedded: ["effects", "system.activities", "system.advancement"],
		selectConverter: selectItemConverter,
		uuidFields: [
			"system.description.journal", // Class, Subclass, Lineage, Heritage,
			"system.restriction.items.*" // Feature, Talent
		]
	},
	JournalEntry: {
		collection: "journal",
		convertible: true,
		embedded: ["pages"],
		selectConverter: () => JournalEntryConversion
	},
	JournalEntryPage: {
		collection: "pages",
		htmlFields: ["description"],
		selectConverter: selectJournalEntryPageConverter,
		uuidFields: [
			"system.item", // Class, Subclass
			"system.spells", // Spell List
			"system.subclasses" // Class
		]
	},
	Macro: {
		collection: "macros"
	},
	MeasuredTemplate: {
		collection: "templates"
	},
	Note: {
		collection: "notes"
	},
	Playlist: {
		collection: "playlists",
		embedded: ["sounds"]
	},
	PlaylistSound: {
		collection: "sounds"
	},
	Region: {
		collection: "regions",
		embedded: ["behaviors"]
	},
	RegionBehavior: {
		collection: "behaviors"
	},
	RollTable: {
		collection: "tables",
		embedded: ["results"]
	},
	Scene: {
		collection: "scenes",
		convertible: true,
		embedded: ["drawings", "lights", "notes", "regions", "sounds", "templates", "tiles", "tokens", "walls"],
		selectConverter: () => SceneConversion
	},
	TableResult: {
		collection: "results"
	},
	Tile: {
		collection: "tiles"
	},
	Token: {
		collection: "tokens"
	},
	Wall: {
		collection: "walls"
	}
};
