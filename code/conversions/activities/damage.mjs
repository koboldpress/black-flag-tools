import BaseActivityConversion from "./base.mjs";

export default class DamageActivityConversion extends BaseActivityConversion {
	static activityType = "damage";

	static paths = [
		...super.paths,
		["damage.critical.allow", "system.damage.critical.allow"],
		["damage.critical.bonus", "system.damage.critical.bonus"],
		["damage.parts", "system.damage.parts", this.convertDamage],
		["effects", "system.effects"]
	];
}
