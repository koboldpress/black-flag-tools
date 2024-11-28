import { default as parseArmorWeapon } from "./armor-weapon.mjs";
import { default as parseEnchantment } from "./enchantment.mjs";
import { default as parseMagicItem } from "./magic-item.mjs";
import { default as parseSpell } from "./spell.mjs";

export default function parseInput(type, input) {
	switch (type) {
		case "ammunition":
		case "armor":
		case "weapon":
			return parseArmorWeapon(type, input);
		case "enchantment":
			return parseEnchantment(type, input);
		case "consumable":
		case "container":
		case "gear":
		case "staff":
			return parseMagicItem(type, input);
		case "spell":
			return parseSpell(type, input);
	}
}
