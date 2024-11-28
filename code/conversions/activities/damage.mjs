import BaseActivityConversion from "./base.mjs";

export default class HealingActivityConversion extends BaseActivityConversion {
	static activityType = "healing";

	static paths = [...super.paths, ["system.damage", "system.damage", this.convertDamage]];
}
