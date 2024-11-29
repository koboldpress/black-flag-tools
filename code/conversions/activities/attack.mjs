import { convertAbility } from "../configs/abilities.mjs";
import BaseActivityConversion from "./base.mjs";

export default class AttackActivityConversion extends BaseActivityConversion {
	static activityType = "attack";

	static paths = [
		...super.paths,
		["attack.ability", "system.attack.ability", convertAbility],
		["attack.bonus", "system.attack.bonus"],
		["attack.critical.threshold", "system.attack.critical.threshold"],
		["attack.flat", "system.attack.flat"],
		["attack.type.value", "system.attack.type.value"],
		["attack.type.classification", "system.attack.type.classification"],
		["damage.critical.bonus", "system.damage.critical.bonus"],
		["damage.includeBase", "system.damage.includeBase"],
		["damage.parts", "system.damage.parts", this.convertDamage],
		["effects", "system.effects"]
	];
}
