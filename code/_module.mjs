/**
 * The Black Flag Conversion Tools for Foundry Virtual Tabletop.
 * Software License: MIT
 * Repository: https://github.com/koboldpress/black-flag-tools
 * Issue Tracker: https://github.com/koboldpress/black-flag-tools/issues
 */

import "../styles/_module.css";

import { selectConverter } from "./conversions/_module.mjs";
import { ParsingApplication } from "./parsing/_module.mjs";
import { ImportingDialog } from "./importing/_module.mjs";
import { DOCUMENT_TYPES } from "./types.mjs";
import { seedRandom } from "./utils.mjs";

Hooks.once("setup", () => {
	// Export options for DnD5e
	if (game.system.id === "dnd5e") {
		Hooks.on("getCompendiumEntryContext", (application, menuItems) => {
			if (!DOCUMENT_TYPES[application.metadata.type]?.convertible) return false;
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

		Hooks.on("getCompendiumDirectoryEntryContext", (application, menuItems) => {
			menuItems.push({
				name: game.i18n.localize("BFTools.Export"),
				icon: '<i class="fa-solid fa-file-export"></i>',
				group: "conversion",
				condition: ([li]) => {
					const pack = game.packs.get(li.closest("[data-pack]")?.dataset.pack);
					return pack && DOCUMENT_TYPES[pack.metadata.type]?.convertible;
				},
				callback: ([li]) => {
					const pack = game.packs.get(li.closest("[data-pack]")?.dataset.pack);
					if (pack) convertCompendium(pack);
				}
			});
		});
	}

	// Import options for Black Flag
	else if (game.system.id === "black-flag") {
		Hooks.on("getCompendiumDirectoryEntryContext", (application, menuItems) => {
			menuItems.push({
				name: game.i18n.localize("BFTools.Import.Action.Import"),
				icon: '<i class="fa-solid fa-file-import"></i>',
				group: "conversion",
				condition: ([li]) => {
					const pack = game.packs.get(li.closest("[data-pack]")?.dataset.pack);
					return pack && DOCUMENT_TYPES[pack.metadata.type]?.convertible;
				},
				callback: ([li]) => {
					const pack = game.packs.get(li.closest("[data-pack]")?.dataset.pack);
					if (pack) ImportingDialog.import(pack);
				}
			});
		});

		Hooks.on("renderCompendium", (app, [html], data) => ParsingApplication.injectSidebarButton(app, html));
	}
});

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
	const final = Converter.convert(data, null, { context: "game", pack, rootDocument: data });
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
