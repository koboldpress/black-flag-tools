import BaseConversion from "./base.mjs";
import { convertTool } from "./configs/tools.mjs";
import ActivitiesConversion from "./templates/activities-conversion.mjs";
import IdentifiableConversion from "./templates/identifiable-conversion.mjs";
import ItemDescriptionConversion from "./templates/item-description-conversion.mjs";
import PhysicalConversion from "./templates/physical-conversion.mjs";

export default class ToolConversion extends BaseConversion {

	static templates = [
		ActivitiesConversion,
		IdentifiableConversion,
		// TODO: Equippable
		ItemDescriptionConversion,
		PhysicalConversion
	];

	static paths = [
		["system.type.value",    "system.type.category", convertTool],
		["system.type.baseItem", "system.type.base",     convertTool]
	];

}
