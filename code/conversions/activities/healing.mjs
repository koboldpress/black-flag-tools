import { convertAbility } from "../configs/abilities.mjs";
import { convertDamage } from "../shared/damage.mjs";
import BaseActivityConversion from "./base.mjs";

export default class HealingActivityConversion extends BaseActivityConversion {

	static activityType = "healing";
	
	static paths = [
		...super.paths,
		["system.ability",      "system.ability",      convertAbility        ],
		["system.damage",       "system.healing",      this.convertHealing    ],
		["system.save.ability", "system.dc.ability",   convertAbility        ],
		["system.save.dc",      "system.dc.formula",   i => String(i ?? "")  ]
	];

	static convertHealing(initial) {
		const part = initial.parts?.[0];
		if ( !part ) return {};
		return convertDamage(part);
	}

}
