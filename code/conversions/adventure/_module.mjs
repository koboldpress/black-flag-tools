import BaseConversion from "../base.mjs";
import selectActorConverter from "../actor/_module.mjs";
import selectItemConverter from "../item/_module.mjs";
import JournalEntryConversion from "../journal/_module.mjs";
import SceneConversion from "../scene/_module.mjs";

export default class AdventureConversion extends BaseConversion {
	static convertBase(initial, context) {
		const final = super.convertBase(initial, context);

		const collections = {
			actors: data => selectActorConverter(data),
			items: data => selectItemConverter(data),
			journal: () => JournalEntryConversion,
			scenes: () => SceneConversion
		};

		for (const [key, selectConverter] of Object.entries(collections)) {
			final[key] = [];
			for (const data of initial[key] ?? []) {
				try {
					final[key].push(selectConverter(data).convert(data, null, { ...context, adventure: initial }));
				} catch (err) {
					console.warn(err.message);
				}
			}
		}

		return final;
	}
}
