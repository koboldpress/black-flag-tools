import BaseConversion from "./base.mjs";
import { convertItemProperty } from "./configs/items.mjs";
import IdentifiableConversion from "./templates/identifiable-conversion.mjs";
import ItemDescriptionConversion from "./templates/item-description-conversion.mjs";
import PhysicalConversion from "./templates/physical-conversion.mjs";

export default class SundryConversion extends BaseConversion {

	static templates = [
		IdentifiableConversion,
		// TODO: Equippable
		// TODO: Currency
		ItemDescriptionConversion,
		PhysicalConversion
	];

	static paths = [
		["system.capacity",   "system.capacity",   SundryConversion.convertCapacity        ],
		["system.properties", "system.properties", i => i?.map(p => convertItemProperty(p))],
	];

	static convertCapacity(initial) {
		switch (initial?.type) {
			case "items": return { count: initial.value };
			case "weight": return { weight: { value: initial.value, units: "pound" } };
		}
	}

}
