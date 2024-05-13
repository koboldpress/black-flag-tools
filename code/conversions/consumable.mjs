import BaseConversion from "./base.mjs";
import { convertConsumableCategory } from "./configs/items.mjs";
import ActivitiesConversion from "./templates/activities-conversion.mjs";
import ItemDescriptionConversion from "./templates/item-description-conversion.mjs";
import PhysicalConversion from "./templates/physical-conversion.mjs";
import PropertiesConversion from "./templates/properties-conversion.mjs";

export default class ConsumableConversion extends BaseConversion {

	static templates = [
		ActivitiesConversion,
		// TODO: Identifiable
		ItemDescriptionConversion,
		PhysicalConversion,
		PropertiesConversion,
	];

	static paths = [
		["system.type.value", "system.type.category", convertConsumableCategory]
	];

}
