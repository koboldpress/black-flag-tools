import BaseConversion from "../../base.mjs";
import { convertLanguage, validLanguage } from "../../configs/traits.mjs";

export default class LanguagesConversion extends BaseConversion {

	static paths = [
		["system.traits.languages", "system.proficiencies.languages", LanguagesConversion.convertLanguages],
	];

	static convertLanguages(initial, context) {
		const final = {
			values: initial.value?.map(v => convertLanguage(v)) ?? [],
			communication: {},
			custom: [],
			tags: []
		};

		for ( let entry of initial.custom?.split(";") ?? [] ) {
			entry = entry.trim();
			if ( !entry ) continue;
	
			// Parse "Telepathy 60 ft." into structured data
			const telepathyMatch = entry.toLowerCase().match(/^telepathy\s+([\d.]+)\s*(\w+)\.?$/);
			if ( telepathyMatch ) {
				let [, range, units] = telepathyMatch;
				if ( ["ft", "foot", "feet"].includes(units) ) units = "foot";
				else if ( ["mi", "mile", "miles"].includes(units) ) units = "mile";
				else if ( ["m", "meter", "meters"].includes(units) ) units = "meter";
				else if ( ["km", "kilometer", "kilometers"].includes(units) ) units = "kilometer";
				else units = null;
				if ( units ) {
					final.communication.telepathy = { range, units };
					continue;
				}
			}

			// Parse "Understands Common but can't speak"
			const cantSpeakMatch = entry.toLowerCase().match(/^understands ([\w\s,]+) but can(?:'|’)?t speak$/);
			if ( cantSpeakMatch ) {
				if ( !final.tags.includes("cantSpeak") ) final.tags.push("cantSpeak");
				for ( let match of cantSpeakMatch[1]?.split(",") ) {
					match = match.toLowerCase().replace("and", "").trim();
					if ( match.includes("knew in life") ) {
						if ( !final.tags.includes("knownInLife") ) final.tags.push("knownInLife");
					} else {
						match = convertLanguage(match);
						if ( validLanguage(match) ) final.values.push(match);
						else final.custom.push(match);
					}
				}
				continue;
			}

			// Parse "Languages known in life"
			if ( entry.match(/(knew|known).*(life|alive)/i) ) {
				if ( !final.tags.includes("knownInLife") ) final.tags.push("knownInLife");
				continue;
			}

			final.custom.push(entry);
		}

		return final;
	}

}
