import { selectConverter } from "./conversions/_module.mjs";
import { ParsingApplication } from "./parsing/_module.mjs";
import { seedRandom } from "./utils.mjs";

Hooks.once("setup", () => {
	// Export options for DnD5e
	if ( game.system.id === "dnd5e" && foundry.utils.isNewerVersion("4.0.0", game.system.version) ) {
		Hooks.on("getCompendiumEntryContext", (application, menuItems) => {
			if ( !["Actor", "Item"].includes(application.metadata.type) ) return false;
			menuItems.push({
				name: game.i18n.localize("BFTools.Export"),
				icon: '<i class="fa-solid fa-file-export"></i>',
				group: "conversion",
				callback: async ([li]) => {
					const doc = await application.collection.getDocument(li.closest("[data-document-id]")?.dataset.documentId);
					if ( doc ) convertDocument(doc);
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
					return pack && ["Actor", "Item"].includes(pack.metadata.type);
				},
				callback: ([li]) => {
					const pack = game.packs.get(li.closest("[data-pack]")?.dataset.pack);
					if ( pack ) convertCompendium(pack);
				}
			});
		});
	}

	// Import options for Black Flag
	else if ( game.system.id === "black-flag" ) {
		Hooks.on("getCompendiumDirectoryEntryContext", (application, menuItems) => {
			menuItems.push({
				name: game.i18n.localize("BFTools.Import.ContextMenuOption"),
				icon: '<i class="fa-solid fa-file-import"></i>',
				group: "conversion",
				condition: ([li]) => {
					const pack = game.packs.get(li.closest("[data-pack]")?.dataset.pack);
					return pack && ["Actor", "Item"].includes(pack.metadata.type);
				},
				callback: ([li]) => {
					const pack = game.packs.get(li.closest("[data-pack]")?.dataset.pack);
					if ( pack ) importToCompendium(pack);
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
 * @returns {object} - Converted object data.
 */
function convertDocument(doc, { download=true }={}) {
	if ( ["character", "vehicle", "group"].includes(doc.type) ) {
		if ( download ) ui.notifications.warn(`Actors of the type "${doc.type}" are not currently supported.`);
		return;
	}
	const data = doc.toObject();
	seedRandom(data._id);
	const Converter = selectConverter(data);
	const final = Converter.convert(data);
	final._documentType = doc.constructor.metadata.name;
	if ( download ) createDownload(`${data.name.slugify()}-${data._id}`, final);
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
async function convertCompendium(pack, { download=true, folders=true }={}) {
	const docs = await pack.getDocuments();
	let final = docs.map(doc => convertDocument(doc, { download: false }));
	if ( folders ) final = final.concat(pack.folders.map(f => {
		const data = f.toObject();
		data._documentType = "Folder";
		return data;
	}));
	if ( download ) createDownload(pack.metadata.label.slugify(), final);
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

/* <><><><> <><><><> <><><><> <><><><> <><><><> <><><><> */
/*                       Importing                       */
/* <><><><> <><><><> <><><><> <><><><> <><><><> <><><><> */

/**
 * Take a export JSON file and import it into a compendium.
 * @param {Compendium} pack - Compendium into which the documents should be imported.
 */
async function importToCompendium(pack) {
	const file = await Dialog.wait({
		title: `Import Data: ${pack.metadata.label}`,
		content: await renderTemplate("templates/apps/import-data.html", {
			hint1: game.i18n.format("BFTools.Import.Hint1", { document: pack.metadata.type }),
			hint2: game.i18n.localize("BFTools.Import.Hint2")
		}),
		buttons: {
			import: {
				icon: '<i class="fa-solid fa-file-import" inert></i>',
				label: "Import",
				callback: html => {
					const form = html.find("form")[0];
					if ( !form.data.files.length ) return ui.notifications.error("No file uploaded to import.");
					return readTextFromFile(form.data.files[0]);
				}
			},
			no: {
				icon: '<i class="fa-solid fa-times"></i>',
				label: "Cancel"
			}
		},
		default: "import"
	}, {
		width: 400
	});

	let data;
	try {
		data = JSON.parse(file);
	} catch(err) {
		ui.notifications.error("Could not parse JSON file.");
		return;
	}

	const docs = [];
	const folders = [];
	for ( const entry of (foundry.utils.getType(data) === "Array" ? data : [data]) ) {
		if ( entry._documentType === "Folder" ) folders.push(entry);
		else docs.push(entry);
	}
	await getDocumentClass("Folder").createDocuments(folders, { keepId: true, pack: pack.metadata.id });
	const created = await getDocumentClass(pack.metadata.type).createDocuments(docs, {
		keepId: true, pack: pack.metadata.id
	});

	if ( created?.length ) ui.notifications.info(game.i18n.format("BFTools.Import.Success", {
		compendium: pack.metadata.label, count: created.length
	}));
}
