import BaseActivityConversion from "./base.mjs";

export default class ForwardActivityConversion extends BaseActivityConversion {
	static activityType = "forward";

	static paths = [...super.paths, ["activity.id", "system.linked.id"]];
}
