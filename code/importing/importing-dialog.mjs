import scanUuids from "./uuid-conversion.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export default class ImportingDialog extends HandlebarsApplicationMixin(ApplicationV2) {
	/** @override */
	static DEFAULT_OPTIONS = {
		classes: ["black-flag", "black-flag-tools", "importer"],
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
	 * @type {Compendium}
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
				{ value: "", label: _loc("BFTools.Import.Remapping.KeepExisting") },
				{ rule: true },
				...Array.from(game.packs.entries()).map(([value, pack]) => this.#packageEntry(value, pack.metadata))
			],
			originals: scanUuids(this.documents)
		};
		context.summary = _loc("BFTools.Import.Summary.Description", {
			count: BlackFlag.utils.formatNumber(this.documents.length),
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
		if (metadata.packageType === "world") data.group = _loc("PACKAGE.Type.world");
		else if (metadata.packageType === "system") data.group = _loc("BF.BlackFlagRoleplaying");
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
				_loc("BFTools.Import.Success", {
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
	 * @param {Compendium} pack - Pack into which the documents should be imported.
	 */
	static async import(pack) {
		const dialogConfig = {
			buttons: [
				{
					action: "import",
					icon: '<i class="fa-solid fa-file-import" inert></i>',
					label: "Import",
					callback: (event, button, dialog) => {
						const form = button.form;
						if (!form.data.files.length) return ui.notifications.error("No file uploaded to import.");
						file = foundry.utils.readTextFromFile(form.data.files[0]);
					},
					default: true
				},
				{
					actions: "no",
					icon: '<i class="fa-solid fa-times"></i>',
					label: "Cancel"
				}
			],
			content: await foundry.applications.handlebars.renderTemplate("templates/apps/import-data.hbs", {
				hint1: _loc("BFTools.Import.Hint1", { document: pack.metadata.type }),
				hint2: _loc("BFTools.Import.Hint2")
			}),
			position: {
				width: 400
			},
			window: {
				title: `Import Data: ${pack.metadata.label}`
			}
		};
		let file;
		try {
			await foundry.applications.api.DialogV2.wait(dialogConfig, { width: 400 });
		} catch {
			return;
		}
		if (!file) return;

		let data;
		try {
			data = JSON.parse(await file);
		} catch {
			ui.notifications.error("Could not parse JSON file.");
			return;
		}

		const options = { documents: [], folders: [], pack };
		console.log(data);
		for (const entry of foundry.utils.getType(data) === "Array" ? data : [data]) {
			if (entry._documentType === "Folder") options.folders.push(entry);
			else options.documents.push(entry);
		}

		new ImportingDialog(options).render({ force: true });
	}
}
