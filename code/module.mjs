import { seedRandom } from "./utils.mjs";
import { selectConverter } from "./conversions/_module.mjs";

Hooks.on("getCompendiumEntryContext", (application, menuItems) => {
	if ( !["Actor", "Item"].includes(application.metadata?.type) ) return;
	menuItems.push({
		name: game.i18n.localize("BFTools.Convert"),
		icon: '<i class="fa-solid fa-file-export"></i>',
		group: "conversion",
		callback: async ([li]) => {
			const doc = await application.collection.getDocument(li.closest("[data-document-id]")?.dataset.documentId);
			if ( doc ) convertDocument(doc);
		}
	});
});

function convertDocument(doc) {
	const data = doc.toObject();
	seedRandom(data._id);
	const Converter = selectConverter(data);
	const final = Converter.convert(data);
	const blob = new Blob([JSON.stringify(final, null, 2)], { type: "application/json" });
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = `${data.name.slugify()}-${data._id}.json`;
	anchor.click();
	URL.revokeObjectURL(url);
}
