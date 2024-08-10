import { getProperty, setProperty } from "../../utils.mjs";
import BaseConversion from "../base.mjs";
import AttackActivityConversion from "../activities/attack.mjs";
import DamageActivityConversion from "../activities/damage.mjs";
import HealActivityConversion from "../activities/heal.mjs";
import SaveActivityConversion from "../activities/save.mjs";
import UtilityActivityConversion from "../activities/utility.mjs";

export default class ActivitiesConversion extends BaseConversion {

	static convert(initial, final) {
		let type;
		switch ( getProperty(initial, "system.actionType") ) {
			case "mwak":
			case "rwak":
			case "msak":
			case "rsak":
				type = "attack";
				break;
			case "heal":
				type = "healing";
				break;
			case "save":
				type = "savingThrow";
				break;
			case "abil":
			case "ench":
			case "summ":
			case "util":
			case "other":
				type = "utility";
				break;
		}
		if ( !type && !getProperty(initial, "system.activation.type") ) return;
		type ??= "utility";

		const activity = {
			attack: AttackActivityConversion,
			damage: DamageActivityConversion,
			healing: HealActivityConversion,
			savingThrow: SaveActivityConversion,
			utility: UtilityActivityConversion
		}[type].convert(initial);

		setProperty(final, `system.activities.${activity._id}`, activity);
	}

}
