import { getProperty, setProperty } from "../../utils.mjs";
import BaseConversion from "../base.mjs";
import { convertAbility } from "../configs/abilities.mjs";
import { convertVehicleType, convertSize } from "../configs/actors.mjs";
import HPConversion from "./templates/hp-conversion.mjs";
import ResistancesConversion from "./templates/resistances-conversion.mjs";
import SourceConversion from "./templates/source-conversion.mjs";

export default class VehicleConversion extends BaseConversion {
	static preSteps = [VehicleConversion.convertAbilities];

	static templates = [HPConversion, ResistancesConversion, SourceConversion];

	static paths = [
		["system.attributes.hp.dt", "system.attributes.ac.threshold"],
		["system.attributes.hp.mt", null],
		["system.attributes.ac.calc", null],
		["system.attributes.ac.flat", "system.attributes.ac.value"],
		["system.attributes.ac.formula", null],
		["system.attributes.ac.motionless", null],
		["system.attributes.actions.stations", null],
		["system.attributes.actions.value", null],
		["system.attributes.actions.thresholds", null],
		["system.attributes.capacity.cargo", "system.attributes.cargo.max"],
		[null, "system.attributes.cargo.units"],
		[null, "system.attributes.crew.required"],
		["system.attributes.capacity.creature", "system.attributes.passengers.max"],
		[null, "system.description.actions"],
		[null, "system.description.bonusActors"],
		[null, "system.description.reactions"],
		["system.details.biography.value", "system.description.value"],
		[null, "system.initiative"],
		["system.traits.dimensions", "system.traits.dimensions", VehicleConversion.convertDimensions],
		[null, "system.traits.dimensions.units"],
		[null, "system.traits.dimensions.width"],
		["system.traits.size", "system.traits.size", convertSize],
		[null, "system.traits.movement.custom"],
		[null, "system.traits.movement.tags"],
		[null, "system.traits.movement.types"],
		[null, "system.traits.movement.units"],
		[null, "system.traits.pace.types"],
		[null, "system.traits.pace.units"],
		["system.vehicleType", "system.traits.type.value", convertVehicleType]
	];

	static postSteps = [VehicleConversion.convertBonuses];

	static convertAbilities(initial, final, context) {
		const abilities = getProperty(initial, "system.abilities") ?? {};
		const modifiers = getProperty(final, "system.modifiers") ?? [];

		if (!Object.keys(abilities).length && context.delta) return;

		for (const [key, data] of Object.entries(abilities)) {
			let mod = data.value ? Math.floor((data.value - 10) / 2) : null;
			setProperty(final, `system.abilities.${convertAbility(key)}`, { mod });

			if (data.bonuses?.check && data.bonuses.check !== "0")
				modifiers.push({
					type: "bonus",
					filter: [
						{ k: "type", v: "ability-check" },
						{ k: "ability", v: convertAbility(key) }
					],
					formula: data.bonuses.check
				});

			if (data.bonuses?.save && data.bonuses.save !== "0")
				modifiers.push({
					type: "bonus",
					filter: [
						{ k: "type", v: "ability-save" },
						{ k: "ability", v: convertAbility(key) }
					],
					formula: data.bonuses.save
				});
		}

		setProperty(final, "system.modifiers", modifiers);
	}

	static convertBonuses(initial, final, context) {
		const bonuses = getProperty(initial, "system.bonuses") ?? {};
		const modifiers = getProperty(final, "system.modifiers") ?? [];

		if (!Object.keys(bonuses).length && context.delta) return;

		const attacks = [
			["mwak", "melee", "weapon"],
			["rwak", "ranged", "weapon"],
			["msak", "melee", "spell"],
			["rsak", "ranged", "spell"]
		];
		for (const [key, type, classification] of attacks) {
			for (const kind of ["attack", "damage"]) {
				if (bonuses[key]?.[kind] && bonuses[key][kind] !== "0")
					modifiers.push({
						type: "bonus",
						filter: [
							{ k: "type", v: "attack" },
							{ k: "kind", v: kind },
							{ k: "activity.type.value", v: type },
							{ k: "activity.type.classification", v: classification }
						],
						formula: bonuses[key][kind]
					});
			}
		}

		if (bonuses.abilities?.check && bonuses.abilities.check !== "0")
			modifiers.push({
				type: "bonus",
				filter: [{ k: "type", v: "ability-check" }],
				formula: bonuses.abilities.check
			});

		if (bonuses.abilities?.save && bonuses.abilities.save !== "0")
			modifiers.push({
				type: "bonus",
				filter: [{ k: "type", v: "ability-save" }],
				formula: bonuses.abilities.save
			});

		// TODO: If spell DC bonus is set, calculate spell bonus and add

		setProperty(final, "system.modifiers", modifiers);
	}

	static DIMENSION_REGEX = /^\s*(?<length>\d+)\s*(?<dimension>\w+\.?)\s*(?:by|x)\s*(?<width>\d+)\s*(?:\w+\.?)/i;

	static convertDimensions(initial, context) {
		const match = initial?.match(VehicleConversion.DIMENSION_REGEX);
		if (!match) return {};
		return {
			length: Number(match.groups.length),
			width: Number(match.groups.width)
		};
	}
}
