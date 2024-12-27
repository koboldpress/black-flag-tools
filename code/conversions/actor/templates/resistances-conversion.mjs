import BaseConversion from "../../base.mjs";
import { convertCondition } from "../../configs/conditions.mjs";
import { convertDamageType } from "../../configs/damage.mjs";

export default class ResistancesConversion extends BaseConversion {

	static paths = [
		["system.traits.ci",   "system.traits.condition.immunities",   ResistancesConversion.convertCondition],
		["system.traits.di",   "system.traits.damage.immunities",      ResistancesConversion.convertDamage   ],
		["system.traits.dr",   "system.traits.damage.resistances",     ResistancesConversion.convertDamage   ],
		["system.traits.dv",   "system.traits.damage.vulnerabilities", ResistancesConversion.convertDamage   ],
	];

	static convertCondition(initial) {
		return {
			value: initial.value?.map(v => convertCondition(v)) ?? [],
			custom: initial.custom?.split(";").map(c => c.trim()).filter(c => c) ?? []
		};
	}

	static convertDamage(initial) {
		return {
			value: initial.value?.map(v => convertDamageType(v)) ?? [],
			custom: initial.custom?.split(";").map(c => c.trim()).filter(c => c) ?? []
		};
		// TODO: Add bypasses once supported
	}

}
