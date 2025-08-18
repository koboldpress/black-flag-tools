import { getProperty, randomID, setProperty } from "../../utils.mjs";
import BaseConversion from "../base.mjs";
import { convertAbility } from "../configs/abilities.mjs";
import { convertActivationType } from "../configs/activation.mjs";
import { convertRecoveryPeriods } from "../configs/usage.mjs";
import { convertDamage } from "../shared/damage.mjs";

export default class BaseAdvancementConversion extends BaseConversion {
	static advancementType = "";

	static convertBase(initial, context) {
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
		return (
			{
				primary: "original",
				secondary: "multiclass"
			}[initial] ?? ""
		);
	}

	static convertSpellConfiguration(initial) {
		const method = initial.method ?? initial.preparation;
		return {
			ability: (initial.ability ?? []).map(a => convertAbility(a)),
			alwaysPrepared: initial.prepared === 2 || initial.preparation === "always",
			mode: ["prepared", "spell"].includes(method) ? "default" : method,
			uses: {
				max: initial.uses?.max,
				period: convertRecoveryPeriods(initial.uses?.per),
				requireSlot: initial.users?.requireSlot
			}
		};
	}
}
