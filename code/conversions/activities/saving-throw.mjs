import { convertAbility } from "../configs/abilities.mjs";
import BaseActivityConversion from "./base.mjs";

export default class SavingThrowActivityConversion extends BaseActivityConversion {

	static activityType = "savingThrow";

	static paths = [
		...super.paths,
		["system.ability",      "system.ability",      convertAbility        ],
		["system.damage",       "system.damage",       this.convertDamage    ],
		["system.save.ability", "system.dc.ability",   convertAbility        ],
		["system.save.dc",      "system.dc.formula",   i => String(i ?? "")  ]
	];
	
}
