import BaseConversion from "../base.mjs";
import { convertSize } from "../configs/actors.mjs";
import { convertCondition } from "../configs/conditions.mjs";
import { convertDamageType } from "../configs/damage.mjs";
import MovementConversion from "./movement-conversion.mjs";
import SensesConversion from "./senses-conversion.mjs";

export default class TraitsConversion extends BaseConversion {

	static templates = [
		MovementConversion,
		SensesConversion,
	];

	static paths = [
		["system.traits.ci",   "system.traits.condition.immunities",   TraitsConversion.convertCondition],
		["system.traits.di",   "system.traits.damage.immunities",      TraitsConversion.convertDamage   ],
		["system.traits.dr",   "system.traits.damage.resistances",     TraitsConversion.convertDamage   ],
		["system.traits.dv",   "system.traits.damage.vulnerabilities", TraitsConversion.convertDamage   ],
		["system.traits.size", "system.traits.size",                   convertSize                      ],
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
