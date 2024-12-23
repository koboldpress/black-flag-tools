import BaseConversion from "./base.mjs";
import selectActorConverter from "./actor/_module.mjs";
import selectItemConverter from "./item/_module.mjs";
import { default as JournalEntryConversion, selectJournalEntryPageConverter } from "./journal/_module.mjs";

export function selectConverter(type, data) {
	switch (type) {
		case "Actor":
			return selectActorConverter(data);
		case "Item":
			return selectItemConverter(data);
		case "JournalEntry":
			return JournalEntryConversion;
		case "JournalEntryPage":
			return selectJournalEntryPageConverter(data);
	}
	return BaseConversion;
}
