import scanUuids from "./uuid-conversion.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export default class ImportingDialog extends HandlebarsApplicationMixin(ApplicationV2) {
	/** @override */
	static DEFAULT_OPTIONS = {
		classes: ["black-flag-tools", "importer"],
		tag: "form",
		window: {
			title: "BFTools.Import.Title",
			icon: "fa-solid fa-download"
		},
		form: {
			handler: ImportingDialog.#handleFormSubmission,
			closeOnSubmit: true
		},
		position: {
			width: 540
		},
		documents: [],
		folders: [],
		pack: null
	};

	/* <><><><> <><><><> <><><><> <><><><> */

	/** @override */
	static PARTS = {
		importer: {
			template: "modules/black-flag-tools/templates/importing-dialog.hbs"
		}
	};

	/* <><><><> <><><><> <><><><> <><><><> */
	/*             Properties              */
	/* <><><><> <><><><> <><><><> <><><><> */

	/**
	 * Data for documents to create.
	 * @type {object[]}
	 */
	get documents() {
		return this.options.documents;
	}

	/* <><><><> <><><><> <><><><> <><><><> */

	/**
	 * Data for folders to create.
	 * @type {object[]}
	 */
	get folders() {
		return this.options.folders;
	}

	/* <><><><> <><><><> <><><><> <><><><> */

	/**
	 * Compendium pack where the documents should be imported.
	 */
	get pack() {
		return this.options.pack;
	}

	/* <><><><> <><><><> <><><><> <><><><> */
	/*              Rendering              */
	/* <><><><> <><><><> <><><><> <><><><> */

	/** @inheritDoc */
	async _prepareContext(options) {
		const context = await super._prepareContext(options);
		context.pack = {
			field: new foundry.data.fields.StringField(),
			options: [
				{ value: "", label: game.i18n.localize("BFTools.Import.Remapping.KeepExisting") },
				{ rule: true },
				...Array.from(game.packs.entries()).map(([value, pack]) => this.#packageEntry(value, pack.metadata))
			],
			originals: scanUuids(this.documents)
		};
		context.summary = game.i18n.format("BFTools.Import.Summary.Description", {
			count: BlackFlag.utils.numberFormat(this.documents.length),
			target: this.pack.metadata.label
		});
		return context;
	}

	/* <><><><> <><><><> <><><><> <><><><> */

	/**
	 * Create a label and group for the provided compendium pack.
	 * @param {string} id - Compendium pack ID.
	 * @param {object} metadata - Compendium metadata.
	 * @returns {FormSelectOption}
	 */
	#packageEntry(id, metadata) {
		const data = { value: id, label: `${metadata.label} (${id})` };
		if (metadata.packageType === "world") data.group = game.i18n.localize("PACKAGE.Type.world");
		else if (metadata.packageType === "system") data.group = game.i18n.localize("BF.BlackFlagRoleplaying");
		else data.group = game.modules.get(metadata.packageName)?.title;
		return data;
	}

	/* <><><><> <><><><> <><><><> <><><><> */
	/*           Form Submission           */
	/* <><><><> <><><><> <><><><> <><><><> */

	/**
	 * Handle final importing.
	 * @this {ImportingDialog}
	 * @param {SubmitEvent} event - The originating form submission event.
	 * @param {HTMLFormElement} form - The form element that was submitted.
	 * @param {FormDataExtended} formData - Processed data for the submitted form.
	 * @returns {Promise<void>}
	 */
	static async #handleFormSubmission(event, form, formData) {
		this.element.querySelector("button").disabled = true;

		await getDocumentClass("Folder").createDocuments(this.folders, { keepId: true, pack: this.pack.metadata.id });

		const replacements = new Map(Object.entries(formData.object).filter(([, v]) => v));
		if (replacements.size) scanUuids(this.documents, { replacements });
		const created = await getDocumentClass(this.pack.metadata.type).createDocuments(this.documents, {
			keepId: true,
			pack: this.pack.metadata.id
		});

		if (created?.length)
			ui.notifications.info(
				game.i18n.format("BFTools.Import.Success", {
					compendium: this.pack.metadata.label,
					count: created.length
				})
			);
	}

	/* <><><><> <><><><> <><><><> <><><><> */
	/*           Factory Methods           */
	/* <><><><> <><><><> <><><><> <><><><> */

	/**
	 * Handle displaying the file selection UI, processing the JSON, and presenting the import UI.
	 */
	static async import(pack) {
		const dialogConfig = {
			title: `Import Data: ${pack.metadata.label}`,
			content: await renderTemplate(`templates/apps/import-data.${game.release.generation < 13 ? "html" : "hbs"}`, {
				hint1: game.i18n.format("BFTools.Import.Hint1", { document: pack.metadata.type }),
				hint2: game.i18n.localize("BFTools.Import.Hint2")
			}),
			buttons: {
				import: {
					icon: '<i class="fa-solid fa-file-import" inert></i>',
					label: "Import",
					callback: html => {
						const form = html.find("form")[0];
						if (!form.data.files.length) return ui.notifications.error("No file uploaded to import.");
						return readTextFromFile(form.data.files[0]);
					}
				},
				no: {
					icon: '<i class="fa-solid fa-times"></i>',
					label: "Cancel"
				}
			},
			default: "import"
		};
		let file;
		try {
			file = await Dialog.wait(dialogConfig, { width: 400 });
		} catch (err) {
			return;
		}

		let data;
		try {
			data = JSON.parse(file);
		} catch (err) {
			ui.notifications.error("Could not parse JSON file.");
			return;
		}

		const options = { documents: [], folders: [], pack };
		for (const entry of foundry.utils.getType(data) === "Array" ? data : [data]) {
			if (entry._documentType === "Folder") options.folders.push(entry);
			else options.documents.push(entry);
		}

		new ImportingDialog(options).render({ force: true });
	}
}
