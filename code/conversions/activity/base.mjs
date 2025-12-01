import { setProperty } from "../../utils.mjs";
import BaseConversion from "../base.mjs";
import { convertActivationType, convertTimePeriod } from "../configs/activation.mjs";
import { convertAreaOfEffectType, convertRangeType, convertTargetType } from "../configs/targeting.mjs";
import { convertDistanceUnit } from "../configs/units.mjs";
import { convertConsumptionTypes } from "../configs/usage.mjs";
import { convertDamage } from "../shared/damage.mjs";
import { convertUsesRecovery } from "../shared/uses.mjs";

export default class BaseActivityConversion extends BaseConversion {
	static activityType = "";

	static paths = [
		["_id", "_id"],
		["activation.condition", "activation.condition"],
		["activation.override", "activation.override"],
		["consumption.spellSlot", "activation.primary"],
		["activation.type", "activation.type", convertActivationType],
		["activation.value", "activation.value"],
		["consumption.scaling.allowed", "consumption.scale.allowed"],
		["consumption.scaling.max", "consumption.scale.max"],
		["consumption.targets", "consumption.targets", initial => initial?.map(i => this.convertConsumptionTarget(i))],
		[null, "description"],
		["duration.concentration", "duration.concentration"],
		["duration.override", "duration.override"],
		["duration.special", "duration.special"],
		["duration.units", "duration.unit", convertTimePeriod],
		["duration.value", "duration.value"],
		["flags", "flags"],
		["img", "img"],
		["name", "name"],
		["range.override", "range.override"],
		["range.special", "range.special"],
		["range.units", "range.unit", i => convertRangeType(convertDistanceUnit(i))],
		["range.value", "range.value"],
		["sort", "sort"],
		["target.affects.choice", "target.affects.choice"],
		["target.affects.count", "target.affects.formula"],
		["target.affects.special", "target.affects.special"],
		["target.affects.type", "target.affects.type", convertTargetType],
		["target.template.count", "target.template.count"],
		["target.template.contiguous", "target.template.connected"],
		["target.template.type", "target.template.type", convertAreaOfEffectType],
		["target.template.size", "target.template.size"],
		["target.template.width", "target.template.width"],
		["target.template.height", "target.template.height"],
		["target.template.units", "target.template.unit", convertDistanceUnit],
		["target.override", "target.override"],
		["target.prompt", "target.prompt"],
		["uses.max", "uses.max"],
		["uses.recovery", "uses.recovery", convertUsesRecovery],
		["uses.spent", "uses.spent"],
		["visibility.identifier", "visibility.identifier"],
		["visibility.level.min", "visibility.level.min"],
		["visibility.level.max", "visibility.level.max"],
		["visibility.requireAttunement", "visibility.requireAttunement"],
		["visibility.requireIdentification", "visibility.requireIdentification"],
		["visibility.requireMagic", "visibility.requireMagic"]
	];

	static convertBase(initial) {
		const activity = { system: {} };
		setProperty(activity, "type", this.activityType);
		return activity;
	}

	static convertConsumptionTarget(initial) {
		return {
			type: convertConsumptionTypes(initial.type),
			target: initial.target, // TODO: See what conversion can be done here if any
			value: initial.value,
			scaling: {
				mode: initial.scaling?.mode,
				formula: initial.scaling?.formula
			}
		};
	}

	static convertDamage(initial) {
		return (initial ?? []).map(p => convertDamage(p));
	}
}
