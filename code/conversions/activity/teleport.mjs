import { convertDistanceUnit } from "../configs/units.mjs";
import BaseActivityConversion from "./base.mjs";

export default class TeleportActivityConversion extends BaseActivityConversion {
	static activityType = "teleport";

	static paths = [
		...super.paths,
		["teleport.value", "system.distance.value"],
		["teleport.units", "system.distance.unit", convertDistanceUnit],
		["teleport.unlimited", "system.unlimited"]
	];
}
