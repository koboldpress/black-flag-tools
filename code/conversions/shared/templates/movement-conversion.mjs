import BaseConversion from "../../base.mjs";
import { convertDistanceUnit } from "../../configs/units.mjs";

export default class MovementConversion extends BaseConversion {

	static paths = [
		["system.attributes.movement", "system.traits.movement", MovementConversion.convertMovement],
		["system.attributes.movement.ignoredDifficultTerrain", "system.trait.movement.ignoredDifficultTerrain"]
	];

	static convertMovement(initial, context) {
		const final = {
			base: initial.walk ?? 30,
			custom: [],
			tags: initial.hover ? ["hover"] : [],
			types: {
				walk: "@base"
			},
			unit: convertDistanceUnit(initial.units) ?? "foot"
		};

		for ( const type of ["burrow", "climb", "fly", "swim"] ) {
			if ( initial[type] ) final.types[type] = initial[type];
		}

		return final;
	}

}
