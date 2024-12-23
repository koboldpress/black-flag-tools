import { convertDamage } from "../shared/damage.mjs";
import BaseActivityConversion from "./base.mjs";

export default class HealActivityConversion extends BaseActivityConversion {
	static activityType = "heal";

	static paths = [...super.paths, ["effects", "system.effects"], ["healing", "system.healing", convertDamage]];
}
