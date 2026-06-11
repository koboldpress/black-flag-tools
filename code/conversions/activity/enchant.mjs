import { setProperty } from "../../utils.mjs";
import { convertAmmunitionCategory } from "../configs/ammunition.mjs";
import { convertArmorCategory } from "../configs/armor.mjs";
import {
	convertConsumableCategory,
	convertGearCategory,
	convertItemProperty,
	convertSundryCategory
} from "../configs/items.mjs";
import { convertTool } from "../configs/tools.mjs";
import { convertWeaponCategory, convertWeaponType } from "../configs/weapons.mjs";
import BaseActivityConversion from "./base.mjs";

export default class EnchantActivityConversion extends BaseActivityConversion {
	static activityType = "enchant";

	static postSteps = [EnchantActivityConversion.convertCategories];

	static paths = [
		...super.paths,
		["enchant.self", "system.autoSelf"],
		["effects", "system.effects"],
		["restrictions.allowMagical", "system.restrictions.allowMagical"],
		["restrictions.properties", "system.restrictions.properties", i => i?.map(p => convertItemProperty(p))],
		["restrictions.type", "system.restrictions.type"]
	];

	static convertCategories(initial, final, context) {
		setProperty(final, "system.restrictions.categories", []);
		setProperty(final, "system.restrictions.types", []);
		for (const category of initial.restrictions?.categories ?? []) {
			switch (final.system?.restrictions?.type) {
				case "ammunition":
					final.system.restrictions.categories.push(convertAmmunitionCategory(category));
					break;
				case "armor":
					final.system.restrictions.categories.push(convertArmorCategory(category));
					break;
				case "consumable":
					final.system.restrictions.categories.push(convertConsumableCategory(category));
					break;
				case "gear":
					final.system.restrictions.categories.push(convertGearCategory(category));
					break;
				case "sundry":
					final.system.restrictions.categories.push(convertSundryCategory(category));
					break;
				case "tool":
					final.system.restrictions.categories.push(convertTool(category));
					break;
				case "weapon":
					final.system.restrictions.categories.push(convertWeaponCategory(category));
					final.system.restrictions.categories.push(convertWeaponType(category));
					break;
			}
		}
	}
}
