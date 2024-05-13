import { getProperty, setProperty } from "../utils.mjs";
import BaseConversion from "./base.mjs";
import { convertArmorCategory, convertArmorType } from "./configs/armor.mjs";
import ItemDescriptionConversion from "./templates/item-description-conversion.mjs";
import PhysicalConversion from "./templates/physical-conversion.mjs";
import PropertiesConversion from "./templates/properties-conversion.mjs";

export default class ArmorConversion extends BaseConversion {

	static preSteps = [
		(i, f) => f.type = "armor"
	];

	static templates = [
		// TODO: Identifiable
		ItemDescriptionConversion,
		PhysicalConversion,
		PropertiesConversion
	];

	static postSteps = [
		ArmorConversion.convertMaxModifier
	];

	static paths = [
		["system.type.value",    "system.type.category", convertArmorCategory],
		["system.type.baseItem", "system.type.base",     convertArmorType    ],
		["system.armor.value",   "system.armor.value",                       ],
		["system.strength",      "system.armor.requiredStrength",            ]
		// TODO: Magical bonus
	];

	static convertMaxModifier(initial, final) {
		const dex = getProperty(initial, "system.armor.dex");
		const type = getProperty(final, "system.type.category");
		const expectedValue = {
			light: null,
			medium: 2,
			heavy: 0
		}[type];
		if ( expectedValue === undefined || expectedValue === dex ) return;
		if ( expectedValue !== dex ) setProperty(final, "system.modifier.max", dex);
	}

}
