import BaseConversion from "./base.mjs";
import AdvancementConversion from "./templates/advancement-conversion.mjs";
import ConceptConversion from "./templates/concept-conversion.mjs";
import ItemDescriptionConversion from "./templates/item-description-conversion.mjs";
import StartingEquipmentConversion from "./templates/starting-equipment-conversion.mjs";

export default class BackgroundConversion extends BaseConversion {
	static templates = [AdvancementConversion, ConceptConversion, ItemDescriptionConversion, StartingEquipmentConversion];
}
