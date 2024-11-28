import { convertAbility } from "./abilities.mjs";
import { convertArmor } from "./armor.mjs";
import { convertSkill } from "./skills.mjs";
import { convertTool } from "./tools.mjs";
import { convertWeapon } from "./weapons.mjs";

export function convertTrait(initial) {
	let [type, ...trait] = initial.split(":");
	trait = trait.join(":");
	switch (type) {
		case "saves":
			trait = convertAbility(trait);
			break;
		case "skills":
			trait = convertSkill(trait);
			break;
		case "languages":
			trait = convertLanguage(trait);
			break;
		case "armor":
			trait = convertArmor(trait);
			break;
		case "weapon":
			trait = convertWeapon(trait);
			break;
		case "tool":
			trait = convertTool(trait);
			break;
		// TODO: di, dr, dv, ci
	}
	return `${type}:${trait}`;
}

export function convertLanguage(initial) {
	initial = initial.replace("exotic:", "esoteric:");
	return (
		{
			deep: "voidSpeech",
			"esoteric:deep": "esoteric:deepSpeech"
		}[initial] ?? initial
	);
}

export function validLanguage(language) {
	return [
		"common",
		"dwarvish",
		"elvish",
		"giant",
		"gnomish",
		"goblin",
		"halfling",
		"orcish",
		"abyssal",
		"celestial",
		"draconic",
		"infernal",
		"machineSpeech",
		"primordial",
		"aquan",
		"auran",
		"ignan",
		"terran",
		"sylvan",
		"undercommon",
		"voidSpeech",
		"druidic",
		"thievesCant"
	].includes(language);
}
