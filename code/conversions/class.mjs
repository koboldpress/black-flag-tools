import { getProperty, randomID, setProperty, staticID } from "../utils.mjs";
import BaseConversion from "./base.mjs";
import { convertAbility } from "./configs/abilities.mjs";
import AdvancementConversion from "./templates/advancement-conversion.mjs";
import ConceptConversion from "./templates/concept-conversion.mjs";
import IdentifiableConversion from "./templates/identifiable-conversion.mjs";
import ItemDescriptionConversion from "./templates/item-description-conversion.mjs";
import SpellcastingConversion from "./templates/spellcasting-conversion.mjs";
import StartingEquipmentConversion from "./templates/starting-equipment-conversion.mjs";

export default class ClassConversion extends BaseConversion {
	static templates = [
		AdvancementConversion,
		ConceptConversion,
		ItemDescriptionConversion,
		SpellcastingConversion,
		StartingEquipmentConversion
	];

	static postSteps = [ClassConversion.convertHitPoints, ClassConversion.convertPrimaryAbility];

	static convertHitPoints(initial, final) {
		const advancement = {
			_id: staticID("bfHitPoints"),
			type: "hitPoints",
			configuration: {
				denomination: Number(getProperty(initial, "system.hitDice")?.substring(1) ?? 6)
			}
		};
		setProperty(final, `system.advancement.${advancement._id}`, advancement);
	}

	static convertPrimaryAbility(initial, final) {
		if (!initial.primaryAbility?.value?.length) return;
		const advancement = {
			_id: staticID("bfKeyAbility"),
			type: "keyAbility",
			configuration: {
				options: initial.primaryAbility.value.map(a => convertAbility(a))
			}
		};
		setProperty(final, `system.advancement.${advancement._id}`, advancement);
	}
}
