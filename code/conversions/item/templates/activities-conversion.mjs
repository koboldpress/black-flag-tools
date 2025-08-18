import { getProperty, setProperty } from "../../../utils.mjs";
import BaseConversion from "../../base.mjs";
import AttackActivityConversion from "../../activity/attack.mjs";
import CastActivityConversion from "../../activity/cast.mjs";
import CheckActivityConversion from "../../activity/check.mjs";
import DamageActivityConversion from "../../activity/damage.mjs";
import ForwardActivityConversion from "../../activity/forward.mjs";
import HealActivityConversion from "../../activity/heal.mjs";
import SaveActivityConversion from "../../activity/save.mjs";
import SummonActivityConversion from "../../activity/summon.mjs";
import UtilityActivityConversion from "../../activity/utility.mjs";
import { convertUsesRecovery } from "../../shared/uses.mjs";

export default class ActivitiesConversion extends BaseConversion {

	static paths = [
		["system.uses.spent", "system.uses.spent"],
		["system.uses.recovery", "system.uses.recovery", convertUsesRecovery],
		["system.uses.max", "system.uses.max"]
	];

	static convert(initial, final, context) {
		const activities = getProperty(initial, "system.activities") ?? {};
		for ( const [key, i] of Object.entries(activities) ) {
			let Converter;
			switch ( i.type ) {
				case "attack": Converter = AttackActivityConversion; break;
				case "cast": Converter = CastActivityConversion; break;
				case "check": Converter = CheckActivityConversion; break;
				case "damage": Converter = DamageActivityConversion; break;
				// case "enchant": Converter = EnchantActivityConversion; break;
				case "forward": Converter = ForwardActivityConversion; break;
				case "heal": Converter = HealActivityConversion; break;
				case "save": Converter = SaveActivityConversion; break;
				case "summon": Converter = SummonActivityConversion; break;
				// case "transform": Converter = TransformActivityConversion; break;
				case "utility":
				default: Converter = UtilityActivityConversion; break;
			}
			activities[key] = Converter.convert(i, null, { ...context, parentDocument: initial, type: "Activity" });
		}
		setProperty(final, "system.activities", activities);
		return super.convert(initial, final, context);
	}
}
