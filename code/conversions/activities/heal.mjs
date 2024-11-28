import { convertDamage } from "../shared/damage.mjs";
import BaseActivityConversion from "./base.mjs";

export default class HealActivityConversion extends BaseActivityConversion {
	static activityType = "healing";

	static paths = [...super.paths, ["system.damage", "system.healing", this.convertHealing]];

	static convertHealing(initial) {
		const part = initial.parts?.[0];
		if (!part) return {};
		return convertDamage(part);
	}
}
