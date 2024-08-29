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
	/*              Consuming              */
	/* <><><><> <><><><> <><><><> <><><><> */

	/**
	 * Consume the remainder of the text and parse it into a description with separate paragraphs.
	 * @returns {string}
	 */
	consumeDescription() {
		const paragraphs = [];
		let paragraph = "";
		const addParagraph = () => {
			// TODO: Process contents of paragraph to add enrichers
			paragraph = paragraph.trim();
			if ( paragraph ) paragraphs.push(`<p>${paragraph.trim()}</p>`);
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
			this.#startIndex = index + 1;
		}
		return result;
	}
}
