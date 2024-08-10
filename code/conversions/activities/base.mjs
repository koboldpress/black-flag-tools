import { randomID, setProperty } from "../../utils.mjs";
import BaseConversion from "../base.mjs";
import { convertActivationType, convertTimePeriod } from "../configs/activation.mjs";
import { convertDistanceUnit } from "../configs/units.mjs";
import { convertDamage } from "../shared/damage.mjs";
import { convertTargeting } from "../shared/targeting.mjs";

export default class BaseActivityConversion extends BaseConversion {

	static activityType = "";

	static paths = [
		["system.activation.cost",      "activation.value",									    																			    ],
		["system.activation.type",      "activation.type",                        convertActivationType                   ],
		// TODO: Prevent activation details from being duplicated when added to spells
		["system.activation.condition", "activation.condition", 							    																		    ],
		["system.duration.value",       "duration.value",                                                                 ],
		["system.duration.units",       "duration.units",                         convertTimePeriod                       ],
		["system.range.value",          "range.value",                                                                    ],
		["system.range.units",          "range.units",                            convertDistanceUnit                     ],
		["system.target",               "target",                                 convertTargeting                        ],
	];

	static convert(initial, final) {
		final = super.convert(initial, final);
		this.setDefaults(initial, final);
		return final;
	}

	static convertBase(initial) {
		const activity = {};

		setProperty(activity, "_id", randomID());
		setProperty(activity, "type", this.activityType);
		setProperty(activity, "activation.primary", true);

		// TODO: Consumption

		return activity;
	}

	static convertDamage(initial) {
		// TODO: Detect when base damage matches weapon damage and set this accordingly
		const damage = { includeBaseDamage: false };
		damage.parts = (initial.parts ?? []).map(part => convertDamage(part));
		return damage;
	}

	static setDefaults(item, activity) {
		switch (item.type) {
			case "spell":
				activity.activation = {};
				activity.duration = {};
				activity.target = {};
			case "weapon":
				activity.range = {};
				break;
		}
	}

}
