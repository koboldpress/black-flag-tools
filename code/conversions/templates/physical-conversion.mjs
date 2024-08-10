import { getProperty, setProperty } from "../../utils.mjs";
import { convertWeightUnit } from "../configs/units.mjs";
import BaseConversion from "../base.mjs";

export default class PhysicalConversion extends BaseConversion {

	static paths = [
		["system.container",          "system.container"                                                        ],
		["system.price.value",        "system.price.value"                                                      ],
		["system.price.denomination", "system.price.denomination"                                               ],
		["system.quantity",           "system.quantity"                                                         ],
		["system.rarity",             "system.rarity"                                                           ],
		["system.weight",             "system.weight",                          PhysicalConversion.convertWeight],
		["system.equipped",           "flags.black-flag.relationship.equipped"                                  ],
	];

	static postSteps = [
		PhysicalConversion.convertAttunement
	];

	static convertAttunement(initial, final) {
		let attunement = getProperty(initial, "system.attunement");
		let attuned = getProperty(initial, "system.attuned");
		if ( Number.isInteger(attunement) ) {
			switch ( attunement ) {
				case 2: attuned = true;
				case 1: attunement = "required"; break;
				case 0: attunement = ""; break;
			}
		}
		setProperty(final, "system.attunement.value", attunement);
		if ( attuned ) setProperty(final, "flags.black-flag.relationship.attuned", true);
	}

	static convertWeight(initial) {
		if ( (typeof initial) === "object" ) {
			return { value: initial.value, units: convertWeightUnit(initial.units) };
		} else {
			return { value: initial, units: "pound" }
		}
	}

}
