import BaseConversion from "../../base.mjs";

export default class HPConversion extends BaseConversion {
	static paths = [
		["system.attributes.hd.spent",   null                          ],
		["system.attributes.hp.formula", null                          ],
		["system.attributes.hp.max",     "system.attributes.hp.max"    ],
		["system.attributes.hp.temp",    "system.attributes.hp.temp"   ],
		["system.attributes.hp.tempmax", "system.attributes.hp.tempmax"],
		["system.attributes.hp.value",   "system.attributes.hp.value"  ],
	];
}
