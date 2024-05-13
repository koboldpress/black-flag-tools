import BaseConversion from "./base.mjs";
import { convertTool } from "./configs/tools.mjs";
import ItemDescriptionConversion from "./templates/item-description-conversion.mjs";
import PhysicalConversion from "./templates/physical-conversion.mjs";

export default class ToolConversion extends BaseConversion {

	static templates = [
		// TODO: Activities
		// TODO: Identifiable
		// TODO: Equippable
		ItemDescriptionConversion,
		PhysicalConversion
	];

	static paths = [
		["system.type.value",    "system.type.category", convertTool],
		["system.type.baseItem", "system.type.base",     convertTool]
	];

}
