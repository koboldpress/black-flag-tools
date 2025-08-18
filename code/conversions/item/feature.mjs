import { getProperty, setProperty } from "../../utils.mjs";
import BaseConversion from "../base.mjs";
import { convertFeatureCategory, convertFeatureType } from "../configs/items.mjs";
import ActivitiesConversion from "./templates/activities-conversion.mjs";
import ItemDescriptionConversion from "./templates/item-description-conversion.mjs";

export default class FeatureConversion extends BaseConversion {
	static preSteps = [FeatureConversion.convertType];

	static templates = [ActivitiesConversion, ItemDescriptionConversion];

	static postSteps = [FeatureConversion.convertRequirements];

	static convertType(initial, final, context) {
		const type = getProperty(initial, "system.type");
		final.type = type?.value === "feat" ? "talent" : "feature";
		if (!type) return;
		setProperty(final, "system.type.category", convertFeatureCategory(type.value));
		setProperty(final, "system.type.value", convertFeatureType(type.subtype));
	}

	static convertRequirements(initial, final, context) {
		const requirements = getProperty(initial, "system.requirements") ?? "";
		const match = requirements.match(/(?<class>\w+)\s+(?<level>\d+)/);
		if (match) {
			const identifier = match.groups.class.toLowerCase();
			const level = Number.parseInt(match.groups.level);
			const validClasses = [
				"barbarian",
				"bard",
				"cleric",
				"druid",
				"fighter",
				"monk",
				"paladin",
				"ranger",
				"rogue",
				"sorcerer",
				"warlock",
				"wizard"
			];
			if (validClasses.includes(identifier) && !Number.isNaN(level)) {
				setProperty(final, "system.identifier.associated", identifier);
				setProperty(final, "system.level.value", Number(match.groups.level));
			}
		}

		const prerequisites = getProperty(initial, "system.prerequisites");
		if (prerequisites) {
			const filters = [];
			if (prerequisites.level)
				filters.push({
					_id: "characterLevel",
					k: "system.progression.level",
					o: "gte",
					v: prerequisites.level
				});
			if (filters.length) setProperty(final, "system.restriction.filters", filters);
			setProperty(final, "system.restriction.allowMultipleTimes", prerequisites.repeatable);
		}
	}
}
