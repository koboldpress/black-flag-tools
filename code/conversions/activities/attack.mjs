import { convertAbility } from "../configs/abilities.mjs";
import BaseActivityConversion from "./base.mjs";

export default class AttackActivityConversion extends BaseActivityConversion {

	static activityType = "attack";

	static paths = [
		...super.paths,
		["system.actionType",   "system.type",         this.convertAttackType],
		["system.ability",      "system.ability",      convertAbility        ],
		["system.attack.bonus", "system.attack.bonus",                       ],
		["system.attack.flat",  "system.attack.flat",                        ],
		["system.damage",       "system.damage",       this.convertDamage    ],
	];

	static convertAttackType(initial) {
		return {
			value: {m: "melee", r: "ranged"}[initial[0]],
			classification: {w: "weapon", s: "spell"}[initial[1]]
		};
	}

}
