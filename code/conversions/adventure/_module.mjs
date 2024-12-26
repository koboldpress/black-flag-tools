import BaseConversion from "../base.mjs";
import selectActorConverter from "../actor/_module.mjs";
import selectItemConverter from "../item/_module.mjs";
import JournalEntryConversion from "../journal/_module.mjs";
import SceneConversion from "../scene/_module.mjs";

export default class AdventureConversion extends BaseConversion {
	static convertBase(initial, context) {
		return super.convertBase(initial, { ...context, adventure: initial });
	}
}
