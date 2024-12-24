import BaseConversion from "../base.mjs";
import NPCConversion from "../actor/npc.mjs";

export default class SceneConversion extends BaseConversion {
	static convertBase(initial, context) {
		const final = super.convertBase(initial, context);

		for (const data of final.tokens ?? []) {
			// Assume all pre-placed actors in scenes are NPCs
			// TODO: If adventure data is available in context, get proper actor type from adventure actor
			const Converter = NPCConversion;
			data.delta = Converter.convert(data.delta, null, { ...context, delta: true, parentDocument: initial });
		}

		return final;
	}
}
