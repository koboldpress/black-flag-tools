import { getProperty, setProperty } from "../utils.mjs";
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
	static preSteps = [WeaponConversion.convertDamage];

	static templates = [
		ActivitiesConversion,
		IdentifiableConversion,
		ItemDescriptionConversion,
		PhysicalConversion,
		PropertiesConversion
	];

	static paths = [
		["system.damage.base", "system.damage.base", convertDamage],
		["system.damage.versatile", null],
		["system.magicalBonus", "system.magicalBonus"],
		["system.range.value", "system.range.short"],
		["system.range.long", "system.range.long"],
		["system.range.reach", "system.range.reach"],
		["system.range.units", "system.range.units", convertDistanceUnit],
		["system.range.value", "system.range.value"],
		["system.type.value", "system.type.value", convertWeaponType],
		["system.type.value", "system.type.category", convertWeaponCategory],
		["system.type.baseItem", "system.type.base", convertWeapon]
	];

	static convertDamage(initial, final) {
		const damage = getProperty(initial, "system.damage.parts") ?? [];
		if (!damage.length) return;
		const part = damage[0];
		if (!part) return;
		const parsed = convertDamage(part);
		if (parsed?.custom || parsed?.bonus !== "@mod") return;
		delete parsed.bonus;
		setProperty(final, "system.damage", parsed);
		damage.pop();
		setProperty(initial, "system.damage.parts", damage);
	}
}
