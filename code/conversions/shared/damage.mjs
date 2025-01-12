import { convertDamageType } from "../configs/damage.mjs";

export function convertDamage(initial) {
	const final = {
		number: initial.number,
		denomination: initial.denomination,
		bonus: initial.bonus,
		custom: {
			enabled: initial.custom?.enabled,
			formula: initial.custom?.formula
		},
		scaling: {
			mode: initial.scaling?.mode,
			number: initial.scaling?.number,
			formula: initial.scaling?.formula
		}
	};

	if (initial.types?.length === 1) {
		final.type = convertDamageType(initial.types[0]);
	} else if (initial.types?.length > 1) {
		final.type = "variable";
		final.additionalTypes = initial.types.map(t => convertDamageType(t));
	}

	return final;
}
