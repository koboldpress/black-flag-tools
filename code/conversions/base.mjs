import { getProperty, setProperty } from "../utils.mjs";

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

	static convertBase(initial) {
		const ignore = ["items", "system", "_stats"];
		const final = {};
		for (const prop of Object.getOwnPropertyNames(initial)) {
			if (ignore.includes(prop)) continue;
			final[prop] = initial[prop];
		}
		return final;
	}
}
