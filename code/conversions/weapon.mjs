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

	static postSteps = [WeaponConversion.convertRange];

	static paths = [
		["system.magicalBonus", "system.magicalBonus"],
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

	static convertRange(initial, final) {
		const system = initial.system ?? {};
		const properties = getProperty(final, "system.properties") ?? [];
		const range = { short: null, long: null, reach: null };
		if (
			final.system?.type?.value === "melee" &&
			properties.includes("reach") &&
			!properties.includes("thrown") &&
			system.range.short > 5
		) {
			range.reach = system.range.short - 5;
		}
		if (final.system?.type?.value === "ranged" || properties.includes("thrown")) {
			range.short = system.range?.value ?? null;
			range.long = system.range?.long ?? null;
		}
		range.units = system.range?.units ? convertDistanceUnit(system.range.units) : "foot";
		setProperty(final, "system.range", range);
	}
}
