import { randomID, getProperty, setProperty } from "../../utils.mjs";
import BaseConversion from "../base.mjs";
import { convertActivationType, convertTimePeriod } from "../configs/activation.mjs";
import { convertDistanceUnit } from "../configs/units.mjs";
import { convertConsumptionTypes } from "../configs/usage.mjs";
import { convertDamage } from "../shared/damage.mjs";
import { convertTargeting } from "../shared/targeting.mjs";

export default class BaseActivityConversion extends BaseConversion {
	static activityType = "";

	static paths = [
		["system.activation.cost", "activation.value"],
		["system.activation.type", "activation.type", convertActivationType],
		["system.activation.condition", "activation.condition"],
		["system.duration.value", "duration.value"],
		["system.duration.units", "duration.units", convertTimePeriod],
		["system.range.value", "range.value"],
		["system.range.units", "range.units", convertDistanceUnit],
		["system.target", "target", convertTargeting]
	];

	static convert(initial, final) {
		final = super.convert(initial, final);
		this.setDefaults(initial, final);
		return final;
	}

	static convertBase(initial) {
		const activity = {};

		setProperty(activity, "_id", randomID());
		setProperty(activity, "type", this.activityType);
		setProperty(activity, "activation.primary", true);

		const consumption = {
			targets: [],
			scale: { allowed: false }
		};
		const consume = getProperty(initial, "system.consume");
		if (consume?.type && consume?.type !== "ammo") {
			const type = convertConsumptionTypes(consume.type);
			if (type) {
				const target = { type, target: consume.target ?? "" };
				if (consume.scale) target.scaling = { mode: "amount" };
				consumption.targets.push(target);
			}
		}
		const uses = getProperty(initial, "system.uses");
		if (uses?.max) consumption.targets.push({ type: "item", value: "1" });
		setProperty(activity, "consumption", consumption);

		return activity;
	}

	static convertDamage(initial) {
		// TODO: Detect when base damage matches weapon damage and set this accordingly
		const damage = { includeBaseDamage: false };
		damage.parts = (initial.parts ?? []).map(part => convertDamage(part));
		return damage;
	}

	static setDefaults(item, activity) {
		switch (item.type) {
			case "spell":
				activity.activation = {};
				activity.duration = {};
				activity.target = {};
			case "weapon":
				activity.range = {};
				break;
		}
	}
}
