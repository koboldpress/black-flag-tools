import BaseConversion from "./base.mjs";
import { convertGearCategory, convertGearType } from "./configs/items.mjs";
import ActivitiesConversion from "./templates/activities-conversion.mjs";
import IdentifiableConversion from "./templates/identifiable-conversion.mjs";
import ItemDescriptionConversion from "./templates/item-description-conversion.mjs";
import PhysicalConversion from "./templates/physical-conversion.mjs";

export default class GearConversion extends BaseConversion {

	static preSteps = [
		(i, f) => f.type = "gear"
	];

	static templates = [
		ActivitiesConversion,
		IdentifiableConversion,
		ItemDescriptionConversion,
		PhysicalConversion
	];

	static paths = [
		["system.type.value",   "system.type.category", convertGearCategory],
		["system.type.subtype", "system.type.value",    convertGearType    ],
	];

}
