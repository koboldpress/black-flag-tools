import { getProperty, randomID, setProperty } from "../utils.mjs";
import BaseConversion from "./base.mjs";
import AdvancementConversion from "./templates/advancement-conversion.mjs";
import ConceptConversion from "./templates/concept-conversion.mjs";
import ItemDescriptionConversion from "./templates/item-description-conversion.mjs";
import SpellcastingConversion from "./templates/spellcasting-conversion.mjs";
import StartingEquipmentConversion from "./templates/starting-equipment-conversion.mjs";

export default class ClassConversion extends BaseConversion {

	static templates = [
		AdvancementConversion,
		ConceptConversion,
		ItemDescriptionConversion,
		SpellcastingConversion,
		StartingEquipmentConversion,
	];

	static postSteps = [
		ClassConversion.convertHitPoints
	];

	static convertHitPoints(initial, final) {
		const advancement = {
			_id: randomID(),
			type: "hitPoints",
			configuration: {
				denomination: Number(getProperty(initial, "system.hitDice")?.substring(1) ?? 6)
			}
		};
		setProperty(final, `system.advancement.${advancement._id}`, advancement);
	}

	// TODO: Wealth
	// TODO: Starting Equipment

}
