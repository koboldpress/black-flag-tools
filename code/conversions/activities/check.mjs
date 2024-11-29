import { convertAbility } from "../configs/abilities.mjs";
import { convertSkill } from "../configs/skills.mjs";
import { convertTool } from "../configs/tools.mjs";
import BaseActivityConversion from "./base.mjs";

export default class CheckActivityConversion extends BaseActivityConversion {
	static activityType = "check";

	static paths = [
		...super.paths,
		["check.ability", "system.check.ability", convertAbility],
		["check.associated", "system.check.associated", initial => initial?.map(i => convertSkill(convertTool(i)))],
		["check.dc.calculation", "system.check.dc.calculation", convertAbility],
		["check.dc.formula", "system.check.dc.formula"],
		[null, "system.check.visible"],
		["effects", "system.effects"]
	];
}
