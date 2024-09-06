import { default as parseArmorWeapon } from "./armor-weapon.mjs";
import { default as parseMagicItem } from "./magic-item.mjs";

export default function parseInput(type, input) {
	switch (type) {
		case "ammunition":
		case "armor":
		case "weapon": return parseArmorWeapon(type, input);
		case "consumable":
		case "container":
		case "gear":
		case "staff": return parseMagicItem(type, input);
	}
}
