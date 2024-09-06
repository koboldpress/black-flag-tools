export default class Parser {
	constructor(text) {
		this.#endIndex = text.length - 1;
		this.#text = text;
	}

	/* <><><><> <><><><> <><><><> <><><><> */

	/**
	 * Index of the end of the string.
	 * @type {number}
	 */
	#endIndex;

	/* <><><><> <><><><> <><><><> <><><><> */

	/**
	 * Index of the last piece of consumed text.
	 * @type {number}
	 */
	#startIndex = 0;

	/* <><><><> <><><><> <><><><> <><><><> */

	/**
	 * Text to be parsed.
	 * @type {string}
	 */
	#text;

	/* <><><><> <><><><> <><><><> <><><><> */

	/**
	 * Remaining text.
	 * @type {string}
	 */
	get remainder() {
		return this.#text.substring(this.#startIndex);
	}

	/* <><><><> <><><><> <><><><> <><><><> */
	/*              Consuming              */
	/* <><><><> <><><><> <><><><> <><><><> */

	/**
	 * Consume attunement description.
	 * @returns {object|void}
	 */
	consumeAttunement() {
		const attunement = this.consumeRegex(/\s*\(Requires Attunement\s*(?<requirement>[^\)]+)?\)/i);
		if ( !attunement ) return;
		const data = { value: "required" };
		if ( attunement.groups.requirement ) data.requirement = attunement.groups.requirement;
		return data;
	}

	/* <><><><> <><><><> <><><><> <><><><> */
	
	/**
	 * Consume cost.
	 * @param {number} basePrice
	 * @returns {object|void}
	 */
	consumeCost(basePrice=0) {
		const cost = this.consumeRegex(/\s*(?<price>[\d,]+) gp(?<base> \+ base [\w]+ cost)?/i);
		let number = Number(cost?.groups.price.replace(",", ""));
		if ( Number.isFinite(number) ) {
			if ( cost.groups.base ) number += basePrice;
			return number;
		}
	}

	/* <><><><> <><><><> <><><><> <><><><> */

	/**
	 * Consume the remainder of the text and parse it into a description with separate paragraphs.
	 * @returns {string}
	 */
	consumeDescription() {
		const paragraphs = [];
		let paragraph = "";
		let inList = false;
		const addParagraph = () => {
			paragraph = paragraph.trim().replaceAll("\t", "");
			if ( paragraph ) {
				const li = paragraph.startsWith("•");
				if ( li ) {
					if ( !inList ) paragraphs.push("<ul>");
					inList = true;
					paragraph = paragraph.replace("•", "");
				}
				else if ( inList ) paragraphs.push("</ul>");
				paragraphs.push(
					`${li ? "<li>" : ""}<p>${this.parseEnrichers(paragraph.trim())}</p>${li ? "</li>" : ""}`
				);
			}
			paragraph = "";
		};
		for ( const line of this.consumeRepeat("\n") ) {
			if ( line ) paragraph += " " + line;
			else addParagraph();
		}
		addParagraph();
		return paragraphs.join("\n");
	}

	/* <><><><> <><><><> <><><><> <><><><> */

	/**
	 * Consume one of the options in the provided enum values and return the matching key.
	 * @param {Record<string, string>} config
	 * @param {object} [options={}]
	 * @param {string} [options.extra] - Extra text to find after the value (e.g. ", " will match "Wondrous Item, ").
   * @returns {string|null}
	 */
	consumeEnum(config, { extra="" }={}) {
		for ( const [key, value] of Object.entries(config) ) {
			if ( this.consumeIfMatches(`${value}${extra}`) ) return key;
		}
		return null;
	}

	/* <><><><> <><><><> <><><><> <><><><> */
	
	/**
	 * Consume and return a single line of text, not including the line end symbol.
	 * @returns {string}
	 */
	consumeLine() {
		return this.consumeUntil("\n").replace("\n", "");
	}

	/* <><><><> <><><><> <><><><> <><><><> */

	/**
	 * Consume text at the start of the string matching the provided regular expression.
	 * @param {RegExp} regex - Regular expression to match.
	 * @returns {string[]|null} - Regular expression match array.
	 */
	consumeRegex(regex) {
		// Should always be locked to start of string and have the `d` flags
		regex = new RegExp(`${regex.source.startsWith("^") ? "" : "^"}${regex.source}`, `${regex.flags}d`);
		const result = regex.exec(this.#text.substring(this.#startIndex));
		if ( result === null ) return null;
		this.#startIndex += result.indices[0][1];
		return result;
	}

	/* <><><><> <><><><> <><><><> <><><><> */

	/**
	 * Consume and return the rest of the input.
	 * @returns {string}
	 */
	consumeRemainder() {
		return this.consumeUntil();
	}

	/* <><><><> <><><><> <><><><> <><><><> */

	/**
	 * Consume until the match is found repeatedly.
	 * @param {string} match - Ending characters to match.
	 * @param {object} [options={}]
	 * @param {boolean} [options.excludeMatch=true] - Don't include match in final string.
	 * @param {number} [options.endAfter] - End after this many matches found, otherwise continue to end of input.
	 */
	consumeRepeat(match, { excludeMatch=true, endAfter=Infinity }={}) {
		let count = 0;
		const matches = [];
		while ( this.#startIndex < this.#endIndex && count < endAfter ) {
			count += 1;
			matches.push(this.consumeUntil(match, { excludeMatch }));
		}
		return matches;
	}

	/* <><><><> <><><><> <><><><> <><><><> */

	/**
	 * Consume text at the start of the string if it matches the provided value, otherwise do nothing.
	 * @param {string} match - Text to match.
	 * @param {object} [options={}]
	 * @param {boolean} [options.matchCase=false] - Should this be a case sensitive match?
	 * @returns {boolean} - If a match is found.
	 */
	consumeIfMatches(match, { matchCase=false }={}) {
		const regex = new RegExp(`\s*${match}`, matchCase ? "" : "i");
		return this.consumeRegex(regex) !== null;
	}

	/* <><><><> <><><><> <><><><> <><><><> */

	/**
	 * Consume the string until the provided string is found or the string ends.
	 * @param {string} [match] - Ending characters to match.
	 * @param {object} [options={}]
	 * @param {boolean} [options.excludeMatch=true] - Don't include match in final string.
	 */
	consumeUntil(match, { excludeMatch=true }={}) {
		let result;
		let index = this.#text.indexOf(match, this.#startIndex);
		if ( index === -1 ) {
			result = this.#text.substring(this.#startIndex);
			this.#startIndex = this.#endIndex;
		} else {
			result = this.#text.substring(this.#startIndex, index);
			if ( excludeMatch ) result.replace(match, "");
			this.#startIndex = index + match.length;
		}
		return result;
	}

	/* <><><><> <><><><> <><><><> <><><><> */
	/*               Parsing               */
	/* <><><><> <><><><> <><><><> <><><><> */

	static enrichers = [
		// Skills
		{
			regex: /DC\s+(?<dc>\d+)\s+(?<ability>\w+)\s+\((?<skill>[\w\s]+)\)\s+check/gdi,
			handler: result => {
				const { ability, dc, skill } = result.groups;
				if ( !(ability.toLowerCase() in CONFIG.BlackFlag.enrichment.lookup.abilities) ) return false;
				if ( !(skill.toLowerCase() in CONFIG.BlackFlag.enrichment.lookup.skills) ) return false;
				return `[[/check ${dc} ${ability} (${skill})]]`;
			}
		},

		// Ability Checks
		{
			regex: /DC\s+(?<dc>\d+)\s+(?<ability>\w+)\s+check/gdi,
			handler: result => {
				const { ability, dc } = result.groups;
				if ( !(ability.toLowerCase() in CONFIG.BlackFlag.enrichment.lookup.abilities) ) return false;
				return `[[/check ${dc} ${ability}]]`;
			}
		},

		// Ability Saves
		{
			regex: /DC\s+(?<dc>\d+)\s+(?<ability>\w+)\s+save/gdi,
			handler: result => {
				const { ability, dc } = result.groups;
				if ( !(ability.toLowerCase() in CONFIG.BlackFlag.enrichment.lookup.abilities) ) return false;
				return `[[/save ${dc} ${ability}]]`;
			}
		},

		// Damage
		{
			regex: /(?<roll>\d+d\d+(?:\s+[+|-|−]\s+\d+)?)\s+(?<type>\w+)\sdamage/gdi,
			handler: result => {
				const { roll, type } = result.groups;
				if ( !(type.toLowerCase() in CONFIG.BlackFlag.damageTypes) ) return false;
				return `[[/damage ${roll} ${type}]]`;
			}
		},

		// Other Roll
		{
			regex: /(\d+d\d+(?:\s+[+|-|−]\s+\d+)?)/gdi,
			handler: result => `[[/r ${result[0].replace("−", "-")}]]`
		}
	];

	/* <><><><> <><><><> <><><><> <><><><> */

	/**
	 * Find potential rolls & DCs in a paragraph and add enrichers.
	 * @param {string} paragraph
	 * @returns {string}
	 */
	parseEnrichers(paragraph) {
		const replacements = [];
		let count = 0;
		for ( const { regex, handler } of Parser.enrichers ) {
			let match;
			const keys = [];
			while ( (match = regex.exec(paragraph)) !== null ) {
				const newValue = handler(match);
				if ( newValue ) {
					const key = `$$${count}$$`;
					replacements.push({ key, newValue });
					keys.unshift({ key, indices: match.indices[0] });
					count++;
				}
			}
			for ( const { key, indices } of keys ) {
				paragraph = paragraph.substring(0, indices[0]) + key + paragraph.substring(indices[1]);
			}
		}
		for ( const { key, newValue } of replacements ) {
			paragraph = paragraph.replace(key, newValue);
		}
		return paragraph;
	}
}
