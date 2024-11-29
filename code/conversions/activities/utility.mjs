import BaseActivityConversion from "./base.mjs";

export default class UtilityActivityConversion extends BaseActivityConversion {
	static activityType = "utility";

	static paths = [
		...super.paths,
		["effects", "system.effects"],
		["roll.formula", "roll.formula"],
		["roll.name", "roll.name"],
		["roll.prompt", "roll.prompt"],
		["roll.visible", "roll.visible"]
	];
}
