import BaseConversion from "../base.mjs";
import { convertDistanceUnit } from "../configs/units.mjs";

export default class MovementConversion extends BaseConversion {

	static paths = [
		["system.attributes.movement", "system.traits.movement", MovementConversion.convertMovement],
	];

	static convertMovement(initial) {
		const final = {
			base: initial.walk ?? 30,
			custom: [],
			tags: initial.hover ? ["hover"] : [],
			types: {
				walk: "@base"
			},
			units: convertDistanceUnit(initial.units) ?? "foot"
		};

		for ( const type of ["burrow", "climb", "fly", "swim"] ) {
			if ( initial[type] ) final.types[type] = initial[type];
		}

		return final;
	}

}
