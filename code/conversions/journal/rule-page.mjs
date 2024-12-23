import BaseConversion from "../base.mjs";

export default class RulePageConversion extends BaseConversion {
	static paths = [
		["system.tooltip", "system.tooltip"],
		["system.type", "system.type"]
	];
}
