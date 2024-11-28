import { convertDamageType } from "../configs/damage.mjs";

const pattern = /^(?<number>\d+)d(?<denomination>\d+)(?:\s+(?<operator>\+|-)\s+(?<bonus>\d+|@[a-zA-Z0-9-_]+))?$/i;

export function convertDamage([formula, type]) {
	const damage = { type: convertDamageType(type) };

	const match = formula.match(pattern);
	if (match) {
		damage.number = Number(match.groups.number);
		damage.denomination = Number(match.groups.denomination);
		if (match.groups.bonus) {
			damage.bonus = match.groups.bonus;
			if (match.groups.operator === "-") damage.bonus = `-${damage.bonus}`;
		}
	} else {
		damage.custom = {
			enabled: true,
			formula
		};
	}

	return damage;
}
