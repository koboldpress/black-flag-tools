import BaseConversion from "../base.mjs";
import AdvancementConversion from "./templates/advancement-conversion.mjs";
import ConceptConversion from "./templates/concept-conversion.mjs";
import ItemDescriptionConversion from "./templates/item-description-conversion.mjs";
import SpellcastingConversion from "./templates/spellcasting-conversion.mjs";

export default class SubclassConversion extends BaseConversion {
	static templates = [AdvancementConversion, ConceptConversion, ItemDescriptionConversion, SpellcastingConversion];

	static paths = [["system.classIdentifier", "system.identifier.class"]];
}
