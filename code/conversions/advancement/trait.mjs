import { convertTrait } from "../configs/traits.mjs";
import BaseActivityConversion from "./base.mjs";

export default class TraitConversion extends BaseActivityConversion {
	static advancementType = "trait";

	static paths = [
		["configuration.hint", "hint"],
		["configuration.mode", "configuration.mode"],
		["configuration.grants", "configuration.grants", TraitConversion.convertGrants],
		["configuration.choices", "configuration.choices", TraitConversion.convertChoices]
	];

	static convertGrants(initial, context) {
		return initial?.map(i => convertTrait(i));
	}

	static convertChoices(initial, context) {
		return initial?.map(i => ({
			count: i.count,
			pool: i.pool?.map(p => convertTrait(p))
		}));
	}
}
