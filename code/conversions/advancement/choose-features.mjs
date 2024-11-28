import { getProperty, setProperty } from "../../utils.mjs";
import { convertFeatureCategory, convertFeatureType } from "../configs/items.mjs";
import BaseActivityConversion from "./base.mjs";

export default class ChooseFeaturesConversion extends BaseActivityConversion {
	static advancementType = "chooseFeatures";

	static paths = [
		["configuration.hint", "hint"],
		["configuration.choices", "configuration.choices", ChooseFeaturesConversion.convertChoices],
		["configuration.allowDrops", "configuration.allowDrops"],
		["configuration.pool", "configuration.pool"],
		["configuration.restriction.type", "configuration.restriction.category", convertFeatureCategory],
		["configuration.restriction.subtype", "configuration.restriction.type", convertFeatureType]
	];

	static postSteps = [ChooseFeaturesConversion.convertItemType];

	static convertChoices(initial) {
		return Object.entries(initial ?? {}).reduce((obj, [k, i]) => {
			if (typeof i === "object") i = i.count;
			obj[k] = i;
			return obj;
		}, {});
	}

	static convertItemType(initial, final) {
		setProperty(
			final,
			"configuration.type",
			getProperty(initial, "configuration.type") === "feat" &&
				getProperty(initial, "configuration.restriction.type") === "feat"
				? "talent"
				: "feature"
		);
	}
}
