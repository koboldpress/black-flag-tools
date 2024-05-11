import { getProperty, randomID, setProperty } from "../../utils.mjs";
import BaseConversion from "../base.mjs";
import { convertActivationType } from "../configs/activation.mjs";
import { convertDamage } from "../shared/damage.mjs";

export default class BaseAdvancementConversion extends BaseConversion {

	static advancementType = "";

	static convertBase(initial) {
		return {
			_id: initial._id,
			type: this.advancementType,
			level: {
				value: initial.level,
				classRestriction: this.convertClassRestriction(initial.classRestriction)
			},
			title: initial.title,
			icon: initial.icon
		};
	}

	static convertClassRestriction(initial) {
		return {
			primary: "original",
			secondary: "multiclass"
		}[initial] ?? "";
	}

	static convertSpellConfiguration(initial) {
		const final = {};
		switch ( initial.preparation ) {
			case "always": final.alwaysPrepared = true;
			case "prepared": final.mode = "default"; break;
			default: final.mode = initial.preparation; break;
		}
		return final;
	}

}
