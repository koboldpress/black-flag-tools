import { setProperty, staticID } from "../../../utils.mjs";
import BaseConversion from "../../base.mjs";
import { convertAbility } from "../../configs/abilities.mjs";

export default class SpellcastingConversion extends BaseConversion {

	static postSteps = [
		SpellcastingConversion.convertSpellcasting
	];

	static convertSpellcasting(initial, final) {
		const spellcasting = initial.system?.spellcasting;
		if ( !spellcasting || spellcasting.progression === "none" ) return;
		const advancement = {
			_id: staticID("bfSpellcasting"),
			type: "spellcasting",
			configuration: {
				ability: convertAbility(spellcasting.ability),
				progression: {
					full: "full",
					half: "half",
					third: "third"
				}[spellcasting.progression],
				type: {
					full: "leveled",
					half: "leveled",
					third: "leveled",
					pact: "pact"
				}[spellcasting.progression]
			}
		};
		setProperty(final, `system.advancement.${advancement._id}`, advancement);
	}

}
