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
 * Document types that can currently be converted.
 * @type {Set<string>}
 */
export const CONVERTABLE_TYPES = new Set(["Actor", "Item", "JournalEntry"]);

/**
 * Foundry's built-in types with information needed to build keys.
 * @enum {{ collection: string, embedded: [string[]] }}
 */
export const DOCUMENT_TYPES = {
	ActiveEffect: {
		collection: "effects"
	},
	Actor: {
		collection: "actors",
		embedded: ["effects", "items"]
	},
	ActorDelta: {
		collection: "delta",
		embedded: ["effects", "items"]
	},
	Adventure: {
		collection: "adventures",
		embedded: ["actors", "combats", "items", "journal", "scenes", "tables", "macros", "cards", "playlists", "folders"]
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
		embedded: ["effects"]
	},
	JournalEntry: {
		collection: "journal",
		embedded: ["pages"]
	},
	JournalEntryPage: {
		collection: "pages"
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
		embedded: ["drawings", "lights", "notes", "regions", "sounds", "templates", "tiles", "tokens", "walls"]
	},
	TableResult: {
		collection: "results"
	},
	Tile: {
		collection: "tiles"
	},
	Token: {
		collection: "tokens",
		embedded: ["delta"]
	},
	Wall: {
		collection: "walls"
	}
};
