import AmmunitionConversion from "./ammunition.mjs";
import ArmorConverion from "./armor.mjs";
import BaseConversion from "./base.mjs";
import BackgroundConversion from "./background.mjs";
import ClassConversion from "./class.mjs";
import ConsumableConversion from "./consumable.mjs";
import ContainerConversion from "./container.mjs";
import FeatureConversion from "./feature.mjs";
import GearConverion from "./gear.mjs";
import LineageConversion from "./lineage.mjs";
import NPCConversion from "./npc.mjs";
import SpellConversion from "./spell.mjs";
import SubclassConversion from "./subclass.mjs";
import SundryConversion from "./sundry.mjs";
import ToolConversion from "./tool.mjs";
import WeaponConversion from "./weapon.mjs";
import { isAmmunition } from "./configs/ammunition.mjs";
import { isArmor } from "./configs/armor.mjs";

export function selectConverter(data) {
	switch (data.type) {
		case "background":
			return BackgroundConversion;
		case "class":
			return ClassConversion;
		case "consumable":
			return isAmmunition(data) ? AmmunitionConversion : ConsumableConversion;
		case "container":
			return ContainerConversion;
		case "equipment":
			return isArmor(data) ? ArmorConverion : GearConverion;
		case "feat":
			return FeatureConversion;
		case "loot":
			return SundryConversion;
		case "npc":
			return NPCConversion;
		case "race":
			return LineageConversion;
		case "spell":
			return SpellConversion;
		case "subclass":
			return SubclassConversion;
		case "tool":
			return ToolConversion;
		case "weapon":
			return WeaponConversion;
		default:
			return BaseConversion;
	}
}
