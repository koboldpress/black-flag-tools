import BaseConversion from "../base.mjs";
import { convertSundryCategory } from "../configs/items.mjs";
import IdentifiableConversion from "./templates/identifiable-conversion.mjs";
import ItemDescriptionConversion from "./templates/item-description-conversion.mjs";
import PhysicalConversion from "./templates/physical-conversion.mjs";

export default class SundryConversion extends BaseConversion {
	static preSteps = [(i, f) => (f.type = "sundry")];

	static templates = [IdentifiableConversion, ItemDescriptionConversion, PhysicalConversion];

	static paths = [["system.type.value", "system.type.category", convertSundryCategory]];
}
