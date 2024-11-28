const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
import parseInput from "./types/_module.mjs";

/**
 * Application for taking a text input and converting it into a Black Flag document.
 */
export default class ParsingApplication extends HandlebarsApplicationMixin(ApplicationV2) {
	/** @override */
	static DEFAULT_OPTIONS = {
		classes: ["black-flag-tools", "parser"],
		tag: "form",
		window: {
			title: "BFTools.Parser.Title",
			icon: "fa-solid fa-file-lines",
			resizable: true
		},
		form: {
			handler: ParsingApplication.#handleFormSubmission,
			closeOnSubmit: true
		},
		position: {
			width: 1024,
			height: 720
		},
		pack: null
	};

	/* <><><><> <><><><> <><><><> <><><><> */

	/** @override */
	static PARTS = {
		input: {
			template: "modules/black-flag-tools/templates/parser-input.hbs"
		},
		output: {
			template: "modules/black-flag-tools/templates/parser-output.hbs"
		},
		footer: {
			template: "modules/black-flag-tools/templates/parser-footer.hbs"
		}
	};

	/* <><><><> <><><><> <><><><> <><><><> */

	static TYPES = {
		spell: {
			label: "BF.Item.Type.Spell[one]",
			template: "modules/black-flag-tools/templates/types/spell-output.hbs"
		},
		ammunition: {
			label: "BF.Item.Type.Ammunition[one]",
			template: "modules/black-flag-tools/templates/types/magic-item-output.hbs",
			group: "BFTools.Parser.MagicItem"
		},
		armor: {
			label: "BF.Item.Type.Armor[one]",
			template: "modules/black-flag-tools/templates/types/magic-item-output.hbs",
			group: "BFTools.Parser.MagicItem"
		},
		consumable: {
			label: "BF.Item.Type.Consumable[one]",
			group: "BFTools.Parser.MagicItem",
			template: "modules/black-flag-tools/templates/types/magic-item-output.hbs"
		},
		container: {
			label: "BF.Item.Type.Container[one]",
			group: "BFTools.Parser.MagicItem",
			template: "modules/black-flag-tools/templates/types/magic-item-output.hbs"
		},
		enchantment: {
			label: "BF.EFFECT.Type.Enchantment[one]",
			group: "BFTools.Parser.MagicItem",
			template: "modules/black-flag-tools/templates/types/enchantment-output.hbs"
		},
		rod: {
			label: "BF.Item.Gear.Category.Rod[one]",
			group: "BFTools.Parser.MagicItem",
			template: "modules/black-flag-tools/templates/types/magic-item-output.hbs"
		},
		staff: {
			label: "BF.Item.Gear.Category.Staff[one]",
			group: "BFTools.Parser.MagicItem",
			template: "modules/black-flag-tools/templates/types/magic-item-output.hbs"
		},
		gear: {
			label: "BF.Item.Gear.Category.WondrousItem[one]",
			group: "BFTools.Parser.MagicItem",
			template: "modules/black-flag-tools/templates/types/magic-item-output.hbs"
		},
		weapon: {
			label: "BF.Item.Type.Weapon[one]",
			template: "modules/black-flag-tools/templates/types/magic-item-output.hbs",
			group: "BFTools.Parser.MagicItem"
		}
	};

	/* <><><><> <><><><> <><><><> <><><><> */
	/*             Properties              */
	/* <><><><> <><><><> <><><><> <><><><> */

	/**
	 * Last successfully parsed document.
	 * @type {Document}
	 */
	document;

	/* <><><><> <><><><> <><><><> <><><><> */

	/**
	 * Inputted text.
	 * @type {string}
	 */
	get input() {
		return this.element.querySelector('[name="input"]')?.value ?? "";
	}

	/* <><><><> <><><><> <><><><> <><><><> */

	/**
	 * Compendium within which the document will be created.
	 * @type {CompendiumCollection}
	 */
	get pack() {
		return this.options.pack;
	}

	/* <><><><> <><><><> <><><><> <><><><> */

	/**
	 * Type of this document to parse.
	 * @type {string}
	 */
	get type() {
		// TODO: Select default input
		return this.element.querySelector('[name="type"]')?.value ?? "gear";
	}

	/* <><><><> <><><><> <><><><> <><><><> */
	/*              Rendering              */
	/* <><><><> <><><><> <><><><> <><><><> */

	/** @inheritDoc */
	async _preparePartContext(partId, context, options) {
		context = { ...(await super._preparePartContext(partId, context, options)) };
		switch (partId) {
			case "footer":
				return this._prepareFooterContext(context, options);
			case "output":
				return this._prepareOutputContext(context, options);
		}
		return context;
	}

	/* <><><><> <><><><> <><><><> <><><><> */

	/**
	 * Prepare rendering context for the footer.
	 * @param {ApplicationRenderContext} context - Context being prepared.
	 * @param {HandlebarsRenderOptions} options - Options which configure application rendering behavior.
	 * @returns {Promise<ApplicationRenderContext>}
	 * @protected
	 */
	async _prepareFooterContext(context, options) {
		const lastType = game.user.getFlag("black-flag-tools", "lastType");
		context.types = {
			field: new foundry.data.fields.StringField(),
			options: Object.entries(this.constructor.TYPES).map(([value, data]) => ({
				value,
				label: game.i18n.localize(data.label),
				group: game.i18n.localize(data.group),
				selected: lastType === value
			}))
		};
		const lastFolder = game.user.getFlag("black-flag-tools", "lastFolder");
		context.folders = {
			field: new foundry.data.fields.StringField(),
			options: [
				{ value: "", label: game.i18n.localize("BFTools.Parser.NoFolder") },
				...this.pack
					._formatFolderSelectOptions()
					.map(({ id, name }) => ({ value: id, label: name, selected: id === lastFolder }))
			]
		};
		return context;
	}

	/* <><><><> <><><><> <><><><> <><><><> */

	/**
	 * Prepare rendering context for the output section.
	 * @param {ApplicationRenderContext} context - Context being prepared.
	 * @param {HandlebarsRenderOptions} options - Options which configure application rendering behavior.
	 * @returns {Promise<ApplicationRenderContext>}
	 * @protected
	 */
	async _prepareOutputContext(context, options) {
		if (this.type && this.input) {
			try {
				const item = await parseInput(this.type, this.input);
				const type = item.effects.size ? "enchantment" : this.type; // TODO: Handle better
				context.preview = await renderTemplate(this.constructor.TYPES[type].template, {
					CONFIG: CONFIG.BlackFlag,
					item,
					enriched: {
						description: await TextEditor.enrichHTML(item.system.description.value ?? "", {
							relativeTo: item,
							secrets: true
						})
					}
				});
				this.document = item;
			} catch (err) {
				context.error = err.message;
				this.document = null;
				console.error(err);
			}
		}
		return context;
	}

	/* <><><><> <><><><> <><><><> <><><><> */
	/*            Event Handlers           */
	/* <><><><> <><><><> <><><><> <><><><> */

	/**
	 * Process form submission.
	 * @this {ParsingApplication}
	 * @param {SubmitEvent} event - The originating form submission event.
	 * @param {HTMLFormElement} form - The form element that was submitted.
	 * @param {FormDataExtended} formData - Processed data for the submitted form.
	 * @returns {Promise<void>}
	 */
	static async #handleFormSubmission(event, form, formData) {
		if (this.document) {
			const cls = getDocumentClass(this.document.documentName);
			const folder = this.element.querySelector('[name="folder"]')?.value;
			await game.user.setFlag("black-flag-tools", "lastType", this.type);
			if (folder !== undefined) await game.user.setFlag("black-flag-tools", "lastFolder", folder);
			const created = await cls.create({ ...this.document.toObject(), folder }, { pack: this.pack.metadata.id });
			created.sheet.render({ force: true });
		}
	}

	/* <><><><> <><><><> <><><><> <><><><> */

	/** @override */
	_onChangeForm(formConfig, event) {
		if (["input", "type"].includes(event.target.name)) this.render({ parts: ["output"] });
	}

	/* <><><><> <><><><> <><><><> <><><><> */
	/*               Helpers               */
	/* <><><><> <><><><> <><><><> <><><><> */

	/**
	 * Inject the parse button into the compendium application during the `renderCompendium` hook.
	 * @param {Compendium} app    The compendium application.
	 * @param {HTMLElement} html  HTML of the application being rendered.
	 */
	static injectSidebarButton(app, html) {
		if (app.collection.locked) return;
		const button = document.createElement("button");
		button.classList.add("parse");
		button.innerHTML = `<i class="fa-solid fa-file-lines" inert></i> ${game.i18n.localize("BFTools.Parser.Title")}`;
		button.addEventListener("click", event => {
			const parser = new ParsingApplication({ pack: app.collection });
			parser.render({ force: true });
		});
		html.querySelector(".header-actions")?.append(button);
	}
}
