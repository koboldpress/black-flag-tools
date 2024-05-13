import BaseConversion from "./base.mjs";
import { convertSundryCategory } from "./configs/items.mjs";
import ItemDescriptionConversion from "./templates/item-description-conversion.mjs";
import PhysicalConversion from "./templates/physical-conversion.mjs";

export default class SundryConversion extends BaseConversion {

	static templates = [
		// TODO: Identifiable
		ItemDescriptionConversion,
		PhysicalConversion
	];

	static paths = [
		["system.type.value", "system.type.category", convertSundryCategory]
	];

}
