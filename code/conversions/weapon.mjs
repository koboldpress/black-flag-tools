import { getProperty } from "../utils.mjs";
import BaseConversion from "./base.mjs";
import { convertItemProperty } from "./configs/items.mjs";
import { convertDistanceUnit } from "./configs/units.mjs";
import { convertWeapon, convertWeaponCategory, convertWeaponType } from "./configs/weapons.mjs";
import { convertDamage } from "./shared/damage.mjs";
import ActivitiesConversion from "./templates/activities-conversion.mjs";
import IdentifiableConversion from "./templates/identifiable-conversion.mjs";
import ItemDescriptionConversion from "./templates/item-description-conversion.mjs";
import PhysicalConversion from "./templates/physical-conversion.mjs";
import PropertiesConversion from "./templates/properties-conversion.mjs";

export default class WeaponConversion extends BaseConversion {

	static templates = [
		ActivitiesConversion,
		IdentifiableConversion,
		// TODO: Equippable
		ItemDescriptionConversion,
		PhysicalConversion,
		PropertiesConversion,
	];

	static postSteps = [
		WeaponConversion.convertRange
	];

	static paths = [
		["system.damage.parts",  "system.damage",        WeaponConversion.convertDamage],
		["system.magicalBonus",  "system.magicalBonus"                                 ],
		["system.type.value",    "system.type.value",    convertWeaponType             ],
		["system.type.value",    "system.type.category", convertWeaponCategory         ],
		["system.type.baseItem", "system.type.base",     convertWeapon                 ],
	];

	static convertDamage(initial) {
		const part = initial[0];
		if ( !part ) return;
		const parsed = convertDamage(part);
		if ( parsed?.custom || parsed?.bonus !== "@mod" ) return;
		delete parsed.bonus;
		return parsed;
	}

	static convertRange(initial, final) {
		const system = initial.system ?? {};
		const properties = getProperty(final, "system.properties") ?? [];
		const range = { short: null, long: null, reach: null };
		if ( final.system?.type?.value === "melee" && properties.includes("reach") && !properties.includes("thrown")
			&& system.range.short > 5 ) {
			range.reach = system.range.short - 5;
		}
		if ( final.system?.type?.value === "ranged" || properties.includes("thrown") ) {
			range.short = system.range?.value ?? null;
			range.long = system.range?.long ?? null;
		}
		range.units = system.range?.units ? convertDistanceUnit(system.range.units) : "foot";
		final.range = range;
	}

}
