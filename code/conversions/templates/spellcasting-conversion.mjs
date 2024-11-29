import { staticID } from "../../utils.mjs";
import BaseConversion from "../base.mjs";

export default class SpellcastingConversion extends BaseConversion {

	static postSteps = [
		SpellcastingConversion.convertSpellcasting
	];

	static convertSpellcasting(initial, final) {
		const advancement = {
			_id: staticID("bfSpellcasting"),
			type: "spellcasting",
			configuration: {
				// TODO: Convert from spellcasting data
			}
		};
	}

}
