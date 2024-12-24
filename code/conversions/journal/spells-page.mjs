import BaseConversion from "../base.mjs";

export default class SpellsPageConversion extends BaseConversion {
	static paths = [
		[null, "system.description.conclusion"],
		["system.description.value", "system.description.introduction"],
		["system.grouping", "system.grouping", i => (i === "level" ? "circle" : i)],
		[null, "system.headingLevel"],
		["system.identifier", null],
		["system.spells", "system.spells"],
		["system.type", null],
		["system.unlinkedSpells", null]
	];
}
