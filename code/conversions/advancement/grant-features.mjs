import BaseActivityConversion from "./base.mjs";

export default class GrantFeaturesConversion extends BaseActivityConversion {

	static advancementType = "grantFeatures";

	static paths = [
		["configuration.items", "configuration.pool", GrantFeaturesConversion.convertPool]
	];

	static convertPool(initial) {
		return initial?.map(i => (typeof i) === "string" ? { uuid: i } : i);
	}

}
