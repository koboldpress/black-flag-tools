import { getProperty, setProperty } from "../../utils.mjs";
import BaseConversion from "../base.mjs";
import AttackActivityConversion from "../activities/attack.mjs";
import CastActivityConversion from "../activities/cast.mjs";
import CheckActivityConversion from "../activities/check.mjs";
import DamageActivityConversion from "../activities/damage.mjs";
import HealActivityConversion from "../activities/heal.mjs";
import SaveActivityConversion from "../activities/save.mjs";
import SummonActivityConversion from "../activities/summon.mjs";
import UtilityActivityConversion from "../activities/utility.mjs";
import { convertUsesRecovery } from "../shared/uses.mjs";

export default class ActivitiesConversion extends BaseConversion {

	static paths = [
		["system.uses.spent", "system.uses.spent"],
		["system.uses.recovery", "system.uses.recovery", convertUsesRecovery],
		["system.uses.max", "system.uses.max"]
	];

	static convert(initial, final) {
		const activities = getProperty(initial, "system.activities") ?? {};
		for ( const [key, i] of Object.entries(activities) ) {
			let Converter;
			switch ( i.type ) {
				case "attack": Converter = AttackActivityConversion; break;
				case "cast": Converter = CastActivityConversion; break;
				case "check": Converter = CheckActivityConversion; break;
				case "damage": Converter = DamageActivityConversion; break;
				// case "enchant": Converter = EnchantActivityConversion; break;
				case "heal": Converter = HealActivityConversion; break;
				case "save": Converter = SaveActivityConversion; break;
				case "summon": Converter = SummonActivityConversion; break;
				case "utility":
				default: Converter = UtilityActivityConversion; break;
			}
			activities[key] = Converter.convert(i);
		}
		setProperty(final, "system.activities", activities);
		return super.convert(initial, final);
	}
}
