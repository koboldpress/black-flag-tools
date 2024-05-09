import { randomID, setProperty } from "../../utils.mjs";
import BaseConversion from "../base.mjs";
import { convertActivationType } from "../configs/activation.mjs";
import { convertDamage } from "../shared/damage.mjs";

export default class BaseActivityConversion extends BaseConversion {

	static activityType = "";

	static paths = [
		["system.activation.cost",      "activation.value",									    																			    ],
		["system.activation.type",      "activation.type",                        convertActivationType                   ],
		["system.activation.condition", "activation.condition", 							    																		    ],
	];

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

}
