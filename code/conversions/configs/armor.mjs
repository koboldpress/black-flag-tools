import { getProperty } from "../../utils.mjs";

export function convertArmor(initial) {
	return initial
		.replace(/^lgt/, "light")
		.replace(/^med/, "medium")
		.replace(/^hvy/, "heavy")
		.replace(/^shl/, "shield")
		.replace(/chainmail$/, "chainMail")
		.replace(/chainshirt$/, "chainShirt")
		.replace(/halfplate$/, "halfPlate")
		.replace(/ringmail$/, "ringMail")
		.replace(/scalemail$/, "scaleMail")
		.replace(/studded$/, "studdedLeather");
}

export function convertArmorCategory(initial) {
	return {}[initial] ?? initial;
}

export function convertArmorType(initial) {
	return convertArmor(initial);
}

export function isArmor(data) {
	return ["light", "medium", "heavy", "natural", "shield"].includes(getProperty(data, "system.type.value"));
}
