import BaseConversion from "../base.mjs";
import ClassPageConversion from "./class-page.mjs";
import MapPageConversion from "./map-page.mjs";
import RulePageConversion from "./rule-page.mjs";
import SpellsPageConversion from "./spells-page.mjs";
import SubclassPageConversion from "./subclass-page.mjs";

export default class JournalEntryConversion extends BaseConversion {}

export function selectJournalEntryPageConverter(data) {
	switch (data.type) {
		case "class":
			return ClassPageConversion;
		case "map":
			return MapPageConversion;
		case "rule":
			return RulePageConversion;
		case "spells":
			return SpellsPageConversion;
		case "subclass":
			return SubclassPageConversion;
		default:
			return BaseConversion;
	}
}
