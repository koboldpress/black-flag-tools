import BaseConversion from "../../base.mjs";
import { convertDistanceUnit } from "../../configs/units.mjs";

export default class MovementConversion extends BaseConversion {

	static paths = [
		["system.attributes.movement", "system.traits.movement", MovementConversion.convertMovement],
		["system.attributes.movement.ignoredDifficultTerrain", "system.trait.movement.ignoredDifficultTerrain"]
	];

	static convertMovement(initial, context) {
		const walkIsBase = Number.isNumeric(initial.walk);

		const final = {
			base: walkIsBase ? Number(initial.walk) ?? 30 : 0,
			custom: [],
			tags: initial.hover ? ["hover"] : [],
			types: {
				walk: walkIsBase || !initial.walk ? "@base" : String(initial.walk)
			},
			unit: convertDistanceUnit(initial.units) ?? "foot"
		};
		// TODO: Handle movement bonus as modifier

		for ( const type of ["burrow", "climb", "fly", "swim"] ) {
			if ( initial[type] ) final.types[type] = initial[type];
		}

		for ( let entry of initial.special?.split(";") ?? [] ) {
			entry = entry.trim();
			if ( !entry ) continue;
			final.custom.push(entry);
		}

		return final;
	}

}
