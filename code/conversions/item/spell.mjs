import { getProperty, setProperty } from "../../utils.mjs";
import BaseConversion from "../base.mjs";
import { convertAbility } from "../configs/abilities.mjs";
import { convertActivationType, convertTimePeriod } from "../configs/activation.mjs";
import { convertSpellSchool } from "../configs/spellcasting.mjs";
import { convertAreaOfEffectType, convertRangeType, convertTargetType } from "../configs/targeting.mjs";
import { convertDistanceUnit } from "../configs/units.mjs";
import ActivitiesConversion from "./templates/activities-conversion.mjs";
import ItemDescriptionConversion from "./templates/item-description-conversion.mjs";

export default class SpellConversion extends BaseConversion {
	static templates = [ActivitiesConversion, ItemDescriptionConversion];

	static paths = [
		["system.activation.cost", "system.casting.value"],
		["system.activation.type", "system.casting.type", convertActivationType],
		["system.activation.condition", "system.casting.condition"],
		["system.level", "system.circle.base"],
		["system.materials.value", "system.components.material.description"],
		["system.materials.consumed", "system.components.material.consumed"],
		["system.materials.cost", "system.components.material.cost"],
		["system.duration.value", "system.duration.value"],
		["system.duration.units", "system.duration.unit", convertTimePeriod],
		["system.range.value", "system.range.value"],
		["system.range.units", "system.range.unit", i => convertRangeType(convertDistanceUnit(i))],
		["system.school", "system.school", convertSpellSchool],
		["system.target.affects.choice", "system.target.affects.choice"],
		["system.target.affects.count", "system.target.affects.formula"],
		["system.target.affects.special", "system.target.affects.special"],
		["system.target.affects.type", "system.target.affects.type", convertTargetType],
		["system.target.template.count", "system.target.template.count"],
		["system.target.template.contiguous", "system.target.template.connected"],
		["system.target.template.type", "system.target.template.type", convertAreaOfEffectType],
		["system.target.template.size", "system.target.template.size"],
		["system.target.template.width", "system.target.template.width"],
		["system.target.template.height", "system.target.template.height"],
		["system.target.template.units", "system.target.template.unit", convertDistanceUnit],
		["system.ability", "flags.black-flag.relationship.ability", convertAbility],
		["system.method", "flags.black-flag.relationship.mode"],
		["system.prepared", "flags.black-flag.relationship.prepared"],
		["system.preparation.mode", "flags.black-flag.relationship.mode"],
		["system.preparation.prepared", "flags.black-flag.relationship.prepared"],
		["system.sourceClass", "flags.black-flag.relationship.origin.identifier"]
	];

	static postSteps = [SpellConversion.convertProperties];

	static convertProperties(initial, final, context) {
		const properties = getProperty(initial, "system.properties");
		const components = [];
		const tags = [];
		for (const prop of properties ?? []) {
			if (prop === "vocal") components.push("verbal");
			else if (["somatic", "material"].includes(prop)) components.push(prop);
			else tags.push(prop);
		}
		setProperty(final, "system.components.required", components);
		setProperty(final, "system.tags", tags);
	}
}
