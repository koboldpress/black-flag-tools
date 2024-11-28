import BaseConversion from "./base.mjs";
import { convertAmmunitionCategory } from "./configs/ammunition.mjs";
import IdentifiableConversion from "./templates/identifiable-conversion.mjs";
import ItemDescriptionConversion from "./templates/item-description-conversion.mjs";
import PhysicalConversion from "./templates/physical-conversion.mjs";
import PropertiesConversion from "./templates/properties-conversion.mjs";

export default class AmmunitionConversion extends BaseConversion {
	static preSteps = [(i, f) => (f.type = "ammunition")];

	static templates = [IdentifiableConversion, ItemDescriptionConversion, PhysicalConversion, PropertiesConversion];

	static paths = [
		["system.magicalBonus", "system.magicalBonus"],
		["system.type.subtype", "system.type.category", convertAmmunitionCategory]
	];
}
