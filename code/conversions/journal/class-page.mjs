import BaseConversion from "../base.mjs";

export default class ClassPageConversion extends BaseConversion {
	static paths = [
		["system.item", "system.item"],
		[null, "system.headingLevel"],
		["system.description.additionalHitPoints", "system.description.additionalHitPoints"],
		["system.description.additionalTraits", "system.description.additionalTraits"],
		["system.description.additionalEquipment", "system.description.additionalEquipment"],
		[null, "system.description.conclusion"],
		["system.description.value", "system.description.introduction"],
		[null, "system.description.subclassAdvancement"],
		["system.description.subclass", "system.description.subclassSection"],
		["system.style", null],
		["system.subclassHeader", null],
		["system.subclassItems", "system.subclasses"]
	];
}
