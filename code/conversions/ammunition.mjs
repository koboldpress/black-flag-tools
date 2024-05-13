import BaseConversion from "./base.mjs";
import { convertAmmunitionCategory } from "./configs/ammunition.mjs";
import ItemDescriptionConversion from "./templates/item-description-conversion.mjs";
import PhysicalConversion from "./templates/physical-conversion.mjs";
import PropertiesConversion from "./templates/properties-conversion.mjs";

export default class AmmunitionConversion extends BaseConversion {

	static preSteps = [
		(i, f) => f.type = "ammunition"
	];

	static templates = [
		// TODO: Identifiable
		ItemDescriptionConversion,
		PhysicalConversion,
		PropertiesConversion,
	];

	static paths = [
		["system.type.subtype", "system.type.category", convertAmmunitionCategory]
		// TODO: Magical bonus
	];

}
