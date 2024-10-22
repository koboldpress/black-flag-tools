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
	 * Consume the casting line of a spell.
	 * @returns {object|void}
	 */
	consumeCasting() {
		const line = this.consumeLine({ startingWith: /Casting Time:/ });
		if ( !line ) return;
		const parser = new Parser(line);
		const value = parser.consumeNumber();
		let type;
		for ( const config of [CONFIG.BlackFlag.actionTypes, CONFIG.BlackFlag.timeUnits] ) {
			type = parser.consumeEnumPlurals(config);
			if ( type ) break;
		}
		return { value, type };
	}

	/* <><><><> <><><><> <><><><> <><><><> */

	/**
	 * Consume the components line of a spell.
	 * @returns {object|void}
	 */
	consumeComponents() {
		const line = this.consumeLine({ startingWith: /Components:/ });
		if ( !line ) return;
		const parser = new Parser(line);
		const results = parser.consumeRegex(
			/\s*(?<required>(?:\w,?\s?)+)(?:\s*\((?<material>[^)]+?(?<consumes>which the spell consumes)?)\))?/i
		);

		// Components
		const required = results.groups.required
			.replaceAll(" ", "")
			.split(",")
			.map(comp =>
				Object.entries(CONFIG.BlackFlag.spellComponents.localizedAbbreviations)
					.find(([, v]) => v.toLowerCase() === comp.toLowerCase())?.[0]
			)
			.filter(_ => _);

		// Material details
		const material = {};
		if ( results.groups.material ) {
			material.description = results.groups.material;
			material.consumed = "consumed" in results.groups;
			const costMatch = material.description.match(/(?<cost>\d+) (?<denomination>gp|sp|ep|pp|cp)/i);
			if ( costMatch ) {
				material.cost = Number(costMatch.groups.cost);
				material.denomination = costMatch.groups.denomination;
			}
		}

		return { required, material };
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
	 * @param {object} [options={}]
	 * @param {Function} [options.process] - Method called for each paragraph, providing the paragraph text and index.
	 * @returns {string}
	 */
	consumeDescription({ process }={}) {
		const paragraphs = [];
		let paragraph = "";
		let inList = false;
		let index = 0;
		const addParagraph = () => {
			paragraph = paragraph.trim().replaceAll("\t", "");
			if ( paragraph ) {
				const li = paragraph.startsWith("•") || paragraph.startsWith("-");
				if ( li ) {
					if ( !inList ) paragraphs.push("<ul>");
					inList = true;
					paragraph = paragraph.replace(/^•|-\s*/, "");
				}
				else if ( inList ) paragraphs.push("</ul>");
				if ( process ) paragraph = process(paragraph, index);
				paragraphs.push(
					`${li ? "<li>" : ""}<p>${this.parseEnrichers(paragraph.trim())}</p>${li ? "</li>" : ""}`
				);
				index += 1;
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
	 * Consume the duration line of a spell.
	 * @returns {object|void}
	 */
	consumeDuration() {
		const line = this.consumeLine({ startingWith: /Duration:/ });
		if ( !line ) return;
		const parser = new Parser(line);
		const value = parser.consumeNumber();
		let units;
		for ( const config of [CONFIG.BlackFlag.durations, CONFIG.BlackFlag.timeUnits] ) {
			units = parser.consumeEnumPlurals(config);
			if ( units ) break;
		}
		return { value, units };
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
	 * Consume one of the values in the provided enum after it has been localized using each plural form and return
	 * the matching key.
	 * @param {LabeledConfiguration|LocalizedConfiguration|NestedTypeConfiguration} config
	 * @param {object} [options={}]
	 * @param {string} [options.extra] - Extra text to find after the value (e.g. ", " will match "Wondrous Item, ").
	 * @returns {string|null}
	 */
	consumeEnumPlurals(config, { extra="" }={}) {
		for ( const pluralRule of ["zero", "one", "two", "few", "many", "other"] ) {
			const localized = BlackFlag.utils.makeLabels(config, { flatten: true, pluralRule, sort: false });
			const key = this.consumeEnum(localized);
			if ( key ) return key;
		}
	}

	/* <><><><> <><><><> <><><><> <><><><> */
	
	/**
	 * Consume and return a single line of text, not including the line end symbol.
	 * @param {RegExp} [options={}]
	 * @param {string} [options.startingWith] - Only consume line if it starts with this.
	 * @returns {string|null}
	 */
	consumeLine({ startingWith }={}) {
		if ( startingWith ) {
			const result = this.consumeRegex(startingWith);
			if ( result === null ) return null;
		}
		return this.consumeUntil("\n").replace("\n", "");
	}

	/* <><><><> <><><><> <><><><> <><><><> */

	/**
	 * Consume a single number.
	 * @returns {number|null}
	 */
	consumeNumber() {
		const number = this.consumeRegex(/\s*\d+\s*/);
		if ( number === null ) return null;
		return Number(number);
	}

	/* <><><><> <><><><> <><><><> <><><><> */

	/**
	 * Consume the range line of a spell.
	 * @returns {{ range: object, template: object }|void}
	 */
	consumeRange() {
		const line = this.consumeLine({ startingWith: /Range:/ });
		if ( !line ) return;
		const parser = new Parser(line);

		// Parse Range
		const range = { value: parser.consumeNumber(), units: null };
		for ( const config of [CONFIG.BlackFlag.distanceUnits, CONFIG.BlackFlag.rangeTypes] ) {
			range.units = parser.consumeEnumPlurals(config);
			if ( range.units ) break;
		}

		// Shape
		const template = {};
		const results = parser.consumeRegex(/\s*\((?<size>\d+)(?<units>[\w-]+)\s+(?<shape>[\w\s]+)\)/i);
		if ( results ) {
			template.size = !Number.isNaN(Number(results.groups.size)) ? Number(results.groups.size) : null;
			template.type = Object.entries(CONFIG.BlackFlag.areaOfEffectTypes.localized)
				.find(([k, v]) => v.toLowerCase() === results.groups.shape)?.[0];
			const unitsParser = new Parser(results.groups.units.replace("-", ""));
			template.units = unitsParser.consumeEnumPlurals(CONFIG.BlackFlag.distanceUnits);
		}

		return { range, template };
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
		const result = regex.exec(this.remainder);
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
		const regex = new RegExp(`\\s*${match}`, matchCase ? "" : "i");
		return this.consumeRegex(regex) !== null;
	}

	/* <><><><> <><><><> <><><><> <><><><> */

	/**
	 * Consume the string until the provided string is found or the string ends.
	 * @param {string} [match] - Ending characters to match.
	 * @param {object} [options={}]
	 * @param {boolean} [options.excludeMatch=true] - Don't include match in final string.
	 * @returns {string}
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
