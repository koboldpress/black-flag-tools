import { getProperty, setProperty, TOOLS } from "../utils.mjs";
import ConversionError from "./error.mjs";

export default class BaseConversion {
	static preSteps = [];

	static templates = [];

	static paths = [];

	static postSteps = [];

	static convert(initial, final, context = {}) {
		if (!final) final = this.convertBase(initial, context);

		// Run preSteps
		for (const step of this.preSteps) {
			step(initial, final, context);
		}

		// Run templates
		for (const template of this.templates) {
			template.convert(initial, final, context);
		}

		// Copy & convert direct paths
		for (const [initialKeyPath, finalKeyPath, conversion] of this.paths) {
			if (initialKeyPath === null || finalKeyPath === null) continue;
			let value = getProperty(initial, initialKeyPath);
			if (value || !context.delta) {
				if (conversion) value = conversion(value, context);
				setProperty(final, finalKeyPath, value);
			}
		}

		// Run postSteps
		for (const step of this.postSteps) {
			step(initial, final, context);
		}

		return final;
	}

	static convertBase(initial, context) {
		const ignore = ["label", "icon", "system", "_stats"];
		const final = {};
		const config = TOOLS.DOCUMENT_TYPES[context?.type];
		for (const prop of Object.getOwnPropertyNames(initial)) {
			if (ignore.includes(prop)) continue;
			if (config?.embedded?.includes(prop)) {
				final[prop] = [];
				const type = TOOLS.typeForCollection(prop);
				if (!initial[prop]?.[Symbol.iterator]) {
					final[prop] = initial[prop];
					continue;
				}
				for (const data of initial[prop] ?? []) {
					try {
						const Converter = TOOLS.DOCUMENT_TYPES[type]?.selectConverter?.(data) ?? BaseConversion;
						final[prop].push(Converter.convert(data, null, { ...context, parentDocument: initial, type }));
					} catch (err) {
						if (err instanceof ConversionError) console.warn(err.message);
						else throw err;
					}
				}
			} else {
				final[prop] = initial[prop];
			}
		}
		return final;
	}
}
