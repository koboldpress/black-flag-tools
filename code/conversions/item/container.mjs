import BaseConversion from "../base.mjs";
import { convertItemProperty } from "../configs/items.mjs";
import { convertVolumeUnit, convertWeightUnit } from "../configs/units.mjs";
import IdentifiableConversion from "./templates/identifiable-conversion.mjs";
import ItemDescriptionConversion from "./templates/item-description-conversion.mjs";
import PhysicalConversion from "./templates/physical-conversion.mjs";

export default class SundryConversion extends BaseConversion {
	static templates = [
		IdentifiableConversion,
		// TODO: Currency
		ItemDescriptionConversion,
		PhysicalConversion
	];

	static paths = [
		["system.capacity", "system.capacity", SundryConversion.convertCapacity],
		["system.capacity.count", "system.capacity.count"],
		["system.capacity.volume.value", "system.capacity.volume.value"],
		["system.capacity.volume.units", "system.capacity.volume.units", convertVolumeUnit],
		["system.capacity.weight.value", "system.capacity.weight.value"],
		["system.capacity.weight.units", "system.capacity.weight.units", convertWeightUnit],
		["system.properties", "system.properties", i => i?.map(p => convertItemProperty(p))]
	];

	static convertCapacity(initial, context) {
		switch (initial?.type) {
			case "items":
				return { count: initial.value };
			case "weight":
				return { weight: { value: initial.value, units: "pound" } };
		}
	}
}
