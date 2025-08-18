import { convertAbility } from "../configs/abilities.mjs";
import BaseActivityConversion from "./base.mjs";

export default class SaveActivityConversion extends BaseActivityConversion {
	static activityType = "save";

	static paths = [
		...super.paths,
		["damage.onSave", "system.damage.onSave"],
		["damage.parts", "system.damage.parts", this.convertDamage],
		["effects", "system.effects"],
		["save.ability", "system.ability", convertAbility],
		["save.dc.calculation", "system.dc.ability", this.convertCalculation],
		["save.dc.formula", "system.dc.formula", i => String(i ?? "")]
	];

	static convertCalculation(initial) {
		if (initial === "custom") return "";
		return convertAbility(initial);
	}
}
