import BaseConversion from "../base.mjs";

export default class SubClassPageConversion extends BaseConversion {
	static paths = [
		["system.item", "system.item"],
		[null, "system.headingLevel"],
		[null, "system.description.conclusion"],
		["system.description.value", "system.description.introduction"],
		["system.style", null]
	];
}
