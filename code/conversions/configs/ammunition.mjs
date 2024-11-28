import { getProperty } from "../../utils.mjs";

export function convertAmmunitionCategory(initial) {
	return {}[initial] ?? initial;
}

export function isAmmunition(data) {
	return getProperty(data, "system.type.value") === "ammo";
}
