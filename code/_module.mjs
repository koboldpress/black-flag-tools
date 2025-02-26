/**
 * The Black Flag Conversion Tools for Foundry Virtual Tabletop.
 * Software License: MIT
 * Repository: https://github.com/koboldpress/black-flag-tools
 * Issue Tracker: https://github.com/koboldpress/black-flag-tools/issues
 */

import "../styles/_module.css";

import { selectConverter } from "./conversions/_module.mjs";
import setupCounter from "./counter.mjs";
import { ParsingApplication } from "./parsing/_module.mjs";
import { ImportingDialog } from "./importing/_module.mjs";
import * as types from "./types.mjs";
import { generateID, seedRandom, TOOLS } from "./utils.mjs";

const { SetField, StringField } = foundry.data.fields;

Object.assign(TOOLS, types);

Hooks.once("init", () => {
	if (game.system.id === "black-flag") {
		game.settings.register("black-flag-tools", "image-counter", {
			name: "BFTools.Setting.ImageCounter.Label",
			hint: "BFTools.Setting.ImageCounter.Hint",
			scope: "client",
			config: true,
			default: false,
			type: Boolean,
			requiresReload: true
		});
		game.settings.register("black-flag-tools", "wellKnownIDPrefix", {
			name: "BFTools.Setting.WellKnownIDPrefix.Label",
			hint: "BFTools.Setting.WellKnownIDPrefix.Hint",
			scope: "client",
			config: true,
			default: "",
			type: String
		});
		game.settings.register("black-flag-tools", "wellKnownIDTypes", {
			name: "BFTools.Setting.WellKnownIDTypes.Label",
			hint: "BFTools.Setting.WellKnownIDTypes.Hint",
			scope: "client",
			config: true,
			default: ["Actor", "Adventure", "Folder", "Item", "JournalEntry", "JournalEntryPage", "RollTable", "Scene"],
			type: new SetField(
				new StringField({
					choices: {
						Actor: "DOCUMENT.Actor",
						Adventure: "DOCUMENT.Adventure",
						Folder: "DOCUMENT.Folder",
						Item: "DOCUMENT.Item",
						JournalEntry: "DOCUMENT.JournalEntry",
						JournalEntryPage: "DOCUMENT.JournalEntryPage",
						RollTable: "DOCUMENT.RollTable",
						Scene: "DOCUMENT.Scene"
					}
				})
			)
		});
	}
});

Hooks.once("setup", () => {
	// Export options for DnD5e
	if (game.system.id === "dnd5e") {
		Hooks.on("getCompendiumEntryContext", (application, menuItems) => {
			if (!types.DOCUMENT_TYPES[application.metadata.type]?.convertible) return false;
			menuItems.push({
				name: game.i18n.localize("BFTools.Export"),
				icon: '<i class="fa-solid fa-file-export"></i>',
				group: "conversion",
				callback: async ([li]) => {
					const doc = await application.collection.getDocument(li.closest("[data-document-id]")?.dataset.documentId);
					if (doc) convertDocument(doc);
				}
			});
		});

		const setCompendiumEntryContext = (application, menuItems) => {
			menuItems.push({
				name: game.i18n.localize("BFTools.Export"),
				icon: '<i class="fa-solid fa-file-export"></i>',
				group: "conversion",
				condition: li => {
					if (!(li instanceof HTMLElement)) li = li[0];
					const pack = game.packs.get(li.closest("[data-pack]")?.dataset.pack);
					return pack && types.DOCUMENT_TYPES[pack.metadata.type]?.convertible;
				},
				callback: li => {
					if (!(li instanceof HTMLElement)) li = li[0];
					const pack = game.packs.get(li.closest("[data-pack]")?.dataset.pack);
					if (pack) convertCompendium(pack);
				}
			});
		};
		Hooks.on("getCompendiumDirectoryEntryContext", setCompendiumEntryContext);
		Hooks.on("getEntryContextApplicationV2", (application, menuItems) => {
			if (!(application instanceof foundry.applications.sidebar.tabs.CompendiumDirectory)) return;
			setCompendiumEntryContext(application, menuItems);
		});
	}

	// Import options for Black Flag
	else if (game.system.id === "black-flag") {
		const setCompendiumEntryContext = (application, menuItems) => {
			menuItems.push({
				name: game.i18n.localize("BFTools.Import.Action.Import"),
				icon: '<i class="fa-solid fa-file-import"></i>',
				group: "conversion",
				condition: li => {
					if (!(li instanceof HTMLElement)) li = li[0];
					const pack = game.packs.get(li.closest("[data-pack]")?.dataset.pack);
					return pack && types.DOCUMENT_TYPES[pack.metadata.type]?.convertible;
				},
				callback: li => {
					if (!(li instanceof HTMLElement)) li = li[0];
					const pack = game.packs.get(li.closest("[data-pack]")?.dataset.pack);
					if (pack) ImportingDialog.import(pack);
				}
			});
		};
		Hooks.on("getCompendiumDirectoryEntryContext", setCompendiumEntryContext);
		Hooks.on("getEntryContextApplicationV2", (application, menuItems) => {
			if (!(application instanceof foundry.applications.sidebar.tabs.CompendiumDirectory)) return;
			setCompendiumEntryContext(application, menuItems);
		});

		Hooks.on("renderCompendium", (app, html, data) => ParsingApplication.injectSidebarButton(app, html));
		Hooks.on("preCreateActor", setWellKnownID);
		Hooks.on("preCreateAdventure", setWellKnownID);
		Hooks.on("preCreateFolder", setWellKnownID);
		Hooks.on("preCreateItem", setWellKnownID);
		Hooks.on("preCreateJournalEntry", setWellKnownID);
		Hooks.on("preCreateJournalEntryPage", setWellKnownID);
		Hooks.on("preCreateRollTable", setWellKnownID);
		Hooks.on("preCreateScene", setWellKnownID);
	}
});

Hooks.once("ready", () => {
	if (game.system.id === "black-flag" && game.settings.get("black-flag-tools", "image-counter")) setupCounter();
});

/* <><><><> <><><><> <><><><> <><><><> <><><><> <><><><> */
/*                   Document Creation                   */
/* <><><><> <><><><> <><><><> <><><><> <><><><> <><><><> */

/**
 * Set a well-known ID for a newly created document.
 * @param {Document} doc - Document being created.
 * @param {object} data - Data used in creating the document.
 * @param {object} options - Document creation options.
 * @param {string} userId - ID of the user performing the creation.
 */
function setWellKnownID(doc, data, options, userId) {
	// Don't set ID if existing ID is set, document is embedded, document doesn't have a name, or no prefix is specified
	if (data._id || (doc.parent && !(doc instanceof JournalEntryPage)) || !doc.name) return;
	const prefix = game.settings.get("black-flag-tools", "wellKnownIDPrefix");
	const types = game.settings.get("black-flag-tools", "wellKnownIDTypes");
	if (!prefix || !types[game.release.generation < 13 ? "includes" : "has"]?.(doc.constructor.metadata?.name)) return;

	// Create a well-known ID, adding incrementing number if the same ID already exists
	let newID = generateID(doc.name, { prefix, type: data.type ?? doc.constructor.metadata?.name });
	let count = 1;
	while (doesIDExist(newID, doc)) newID = newID.slice(0, -String(count).length).concat(count++);

	// Save the new ID to the creation data
	doc.updateSource({ _id: newID });
	options.keepId = true;
	BlackFlag.utils.log(`Created ${doc.constructor.metadata?.name} with well-known ID: ${newID}`);
}

/* <><><><> <><><><> <><><><> <><><><> <><><><> <><><><> */

/**
 * Check to see if the provided ID exists relative to where the document will be created.
 * @param {string} id
 * @param {Document} doc
 */
function doesIDExist(id, doc) {
	if (doc.parent) return !!doc.parent.getEmbeddedDocument(doc.constructor.metadata.name, id);
	if (game.release.generation < 13 && doc.pack) return doc.compendium.index.has(id);
	return doc.collection.has(id);
}

/* <><><><> <><><><> <><><><> <><><><> <><><><> <><><><> */
/*                Conversion & Exporting                 */
/* <><><><> <><><><> <><><><> <><><><> <><><><> <><><><> */

/**
 * Convert a document and download them as a JSON file that can be imported into Black Flag.
 * @param {Document} docs - Document to convert.
 * @param {object} [options={}]
 * @param {boolean} [options.download=true] - Should a JSON be downloaded?
 * @param {Compendium} [options.pack] - Compendium pack containing the document.
 * @returns {object} - Converted object data.
 */
function convertDocument(doc, { download = true, pack } = {}) {
	const data = doc.toObject();
	seedRandom(data._id);
	let Converter;
	try {
		Converter = selectConverter(doc.constructor.metadata.name, data);
	} catch (err) {
		if (download) ui.notifications.warn(err.message);
		return;
	}
	const final = Converter.convert(data, null, {
		context: "game",
		pack,
		rootDocument: data,
		type: doc.constructor.metadata.name
	});
	final._documentType = doc.constructor.metadata.name;
	if (download) createDownload(`${data.name.slugify()}-${data._id}`, final);
	return final;
}

/* <><><><> <><><><> <><><><> <><><><> <><><><> <><><><> */

/**
 * Convert multiple documents and download them as a JSON file that can be imported into Black Flag.
 * @param {Document[]} docs - Documents to convert.
 * @param {object} [options={}]
 * @param {boolean} [options.download=true] - Should a JSON be downloaded?
 * @param {boolean} [options.folders=true] - Should folders be exported?
 * @returns {object[]} - Array of converted object data.
 */
async function convertCompendium(pack, { download = true, folders = true } = {}) {
	const docs = await pack.getDocuments();
	let final = docs.map(doc => convertDocument(doc, { download: false, pack }));
	if (folders)
		final = final.concat(
			pack.folders.map(f => {
				const data = f.toObject();
				data._documentType = "Folder";
				return data;
			})
		);
	if (download) createDownload(pack.metadata.label.slugify(), final);
	return final;
}

/* <><><><> <><><><> <><><><> <><><><> <><><><> <><><><> */

/**
 * Download a JSON file.
 * @param {any} json - Any JSON serializable data.
 */
function createDownload(filename, json) {
	const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = `${filename}.json`;
	anchor.click();
	URL.revokeObjectURL(url);
}
