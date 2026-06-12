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
		const required = this.consumeRegex(/\s*\(Requires Attunement\s*(?<requirement>[^\)]+)?\)/i);
		if (required) {
			const data = { value: "required" };
			if (required.groups.requirement) data.requirement = required.groups.requirement;
			return data;
		}
		const optional = this.consumeRegex(/\s*\([^)]+ Require Attunement\)/i);
		if (optional) return { value: "optional" };
	}

	/* <><><><> <><><><> <><><><> <><><><> */

	/**
	 * Consume the casting line of a spell.
	 * @returns {object|void}
	 */
	consumeCasting() {
		const line = this.consumeLine({ startingWith: /Casting Time:/ });
		if (!line) return;
		const parser = new Parser(line);
		const value = parser.consumeNumber();
		let type;
		for (const config of [CONFIG.BlackFlag.actionTypes, CONFIG.BlackFlag.timeUnits]) {
			type = parser.consumeEnumPlurals(config);
			if (type) break;
		}
		// Capture any trailing trigger clause (e.g. reactions: "1 reaction, when an ally …").
		// Strip leading punctuation/whitespace delimiter, then store verbatim as condition.
		const result = { value, type };
		const condition = parser
			.consumeRemainder()
			.trim()
			.replace(/^[,;:\s]+/, "")
			.trim();
		if (condition) result.condition = condition;
		return result;
	}

	/* <><><><> <><><><> <><><><> <><><><> */

	/**
	 * Consume the components line of a spell.
	 * @returns {object|void}
	 */
	consumeComponents() {
		const line = this.consumeLine({ startingWith: /Components:/ });
		if (!line) return;
		const parser = new Parser(line);
		const results = parser.consumeRegex(
			/\s*(?<required>(?:\w,?\s?)+)(?:\s*\((?<material>[^)]+?(?<consumes>which the spell consumes)?)\))?/i
		);

		// Components
		const required = results.groups.required
			.replaceAll(" ", "")
			.split(",")
			.map(
				comp =>
					Object.entries(CONFIG.BlackFlag.spellComponents.localizedAbbreviations).find(
						([, v]) => v.toLowerCase() === comp.toLowerCase()
					)?.[0]
			)
			.filter(_ => _);

		// Material details
		const material = {};
		if (results.groups.material) {
			material.description = results.groups.material;
			material.consumed = "consumed" in results.groups;
			const costMatch = material.description.match(/(?<cost>\d+) (?<denomination>gp|sp|ep|pp|cp)/i);
			if (costMatch) {
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
	consumeCost(basePrice = 0) {
		const cost = this.consumeRegex(/\s*(?<price>[\d,]+) gp(?<base> \+ base [\w]+ cost)?/i);
		let number = Number(cost?.groups.price.replace(",", ""));
		if (Number.isFinite(number)) {
			if (cost.groups.base) number += basePrice;
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
	consumeDescription({ process } = {}) {
		const paragraphs = [];
		let paragraph = "";
		let inList = false;
		let index = 0;
		const addParagraph = () => {
			paragraph = paragraph.trim().replaceAll("\t", "");
			if (paragraph) {
				const li = paragraph.startsWith("•") || paragraph.startsWith("-");
				if (li) {
					if (!inList) paragraphs.push("<ul>");
					inList = true;
					paragraph = paragraph.replace(/^•|-\s*/, "");
				} else if (inList) paragraphs.push("</ul>");
				if (process) paragraph = process(paragraph, index);
				const inner = this.parseEnrichers(paragraph.trim());
				// If the paragraph's content begins with a block-level element, don't wrap it in
				// <p> — nesting block elements inside <p> produces invalid HTML5.
				const isBlock = /^<(blockquote|div|ul|ol|table|pre|h[1-6]|p|figure|hr)\b/i.test(inner);
				const wrapped = isBlock ? inner : `<p>${inner}</p>`;
				paragraphs.push(`${li ? "<li>" : ""}${wrapped}${li ? "</li>" : ""}`);
				index += 1;
			}
			paragraph = "";
		};
		for (const line of this.consumeRepeat("\n")) {
			if (line) paragraph += (paragraph ? " " : "") + line;
			else addParagraph();
		}
		addParagraph();
		return paragraphs.join("\n");
	}

	/* <><><><> <><><><> <><><><> <><><><> */

	/**
	 * Consume the duration line of a spell.
	 * @returns {{ duration: object, concentration: boolean }|void}
	 */
	consumeDuration() {
		const line = this.consumeLine({ startingWith: /Duration:/ });
		if (!line) return;
		const parser = new Parser(line);
		const concentration = !!parser.consumeIfMatches("Concentration, up to ");
		const duration = { value: null, unit: null };
		// Non-scalar special and permanent durations are checked before consumeEnumPlurals
		// to prevent prefix collisions. makeLabels flattens CONFIG.BlackFlag.durations and
		// sorts entries alphabetically by label — "Until Dispelled" sorts before "Until
		// Dispelled or Triggered", so consumeEnumPlurals would prefix-match the shorter
		// phrase first and return the wrong key. Testing our explicit list first avoids this.
		// Ordered most-specific-first for the same reason.
		const specialDurations = [
			["until destroyed or dispelled", "destroyed"],
			["until dispelled or triggered", "triggered"],
			["until dispelled", "dispelled"],
			["instantaneous", "instantaneous"],
			["permanent", "permanent"],
			["special", "special"]
		];
		for (const [phrase, key] of specialDurations) {
			if (parser.consumeIfMatches(phrase)) {
				duration.unit = key;
				break;
			}
		}
		// Scalar durations (e.g. "1 minute") fall through to number + enum parsing.
		if (!duration.unit) {
			duration.value = parser.consumeNumber();
			for (const config of [CONFIG.BlackFlag.durations, CONFIG.BlackFlag.timeUnits]) {
				duration.unit = parser.consumeEnumPlurals(config);
				if (duration.unit) break;
			}
		}
		return { duration, concentration };
	}

	/* <><><><> <><><><> <><><><> <><><><> */

	/**
	 * Consume one of the options in the provided enum values and return the matching key.
	 * @param {Record<string, string>} config
	 * @param {object} [options={}]
	 * @param {string} [options.extra] - Extra text to find after the value (e.g. ", " will match "Wondrous Item, ").
	 * @returns {string|null}
	 */
	consumeEnum(config, { extra = "" } = {}) {
		for (const [key, value] of Object.entries(config)) {
			if (this.consumeIfMatches(`${value}${extra}`)) return key;
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
	consumeEnumPlurals(config, { extra = "" } = {}) {
		for (const pluralRule of ["zero", "one", "two", "few", "many", "other"]) {
			const localized = BlackFlag.utils.makeLabels(config, { flatten: true, pluralRule, sort: false });
			const key = this.consumeEnum(localized);
			if (key) return key;
		}
		return null;
	}

	/* <><><><> <><><><> <><><><> <><><><> */

	/**
	 * Consume and return a single line of text, not including the line end symbol.
	 * @param {RegExp} [options={}]
	 * @param {string} [options.startingWith] - Only consume line if it starts with this.
	 * @returns {string|null}
	 */
	consumeLine({ startingWith } = {}) {
		if (startingWith) {
			const result = this.consumeRegex(startingWith);
			if (result === null) return null;
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
		if (number === null) return null;
		return Number(number);
	}

	/* <><><><> <><><><> <><><><> <><><><> */

	/**
	 * Consume the range line of a spell.
	 * @returns {{ range: object, template: object }|void}
	 */
	consumeRange() {
		const line = this.consumeLine({ startingWith: /Range:/ });
		if (!line) return;
		const parser = new Parser(line);

		// Parse Range
		const range = { value: parser.consumeNumber(), unit: null };
		for (const config of [CONFIG.BlackFlag.distanceUnits, CONFIG.BlackFlag.rangeTypes]) {
			range.unit = parser.consumeEnumPlurals(config);
			if (range.unit) break;
		}

		// Shape
		const template = {};
		const results = parser.consumeRegex(/\s*\((?<size>\d+)(?<unit>[\w-]+)\s+(?<shape>[\w\s]+)\)/i);
		if (results) {
			template.size = !Number.isNaN(Number(results.groups.size)) ? Number(results.groups.size) : null;
			template.type = Object.entries(CONFIG.BlackFlag.areaOfEffectTypes.localized).find(
				([k, v]) => v.toLowerCase() === results.groups.shape
			)?.[0];
			const unitParser = new Parser(results.groups.unit.replace("-", ""));
			template.unit = unitParser.consumeEnumPlurals(CONFIG.BlackFlag.distanceUnits);
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
		if (result === null) return null;
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
	 * @returns {string[]}
	 */
	consumeRepeat(match, { excludeMatch = true, endAfter = Infinity } = {}) {
		let count = 0;
		const matches = [];
		while (this.#startIndex < this.#endIndex && count < endAfter) {
			count += 1;
			matches.push(this.consumeUntil(match, { excludeMatch }));
		}
		return matches;
	}

	/* <><><><> <><><><> <><><><> <><><><> */

	/**
	 * Consume text at the start of the string if it matches the provided value, otherwise do nothing.
	 * @param {RegExp|string} match - Text to match.
	 * @param {object} [options={}]
	 * @param {boolean} [options.matchCase=false] - Should this be a case sensitive match?
	 * @returns {boolean} - If a match is found.
	 */
	consumeIfMatches(match, { matchCase = false } = {}) {
		const regex = match instanceof RegExp ? match : new RegExp(`\\s*${match}`, matchCase ? "" : "i");
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
	consumeUntil(match, { excludeMatch = true } = {}) {
		let result;
		let index = this.#text.indexOf(match, this.#startIndex);
		if (index === -1) {
			result = this.#text.substring(this.#startIndex);
			this.#startIndex = this.#endIndex;
		} else {
			result = this.#text.substring(this.#startIndex, index);
			if (excludeMatch) result.replace(match, "");
			this.#startIndex = index + match.length;
		}
		return result;
	}

	/* <><><><> <><><><> <><><><> <><><><> */
	/*               Parsing               */
	/* <><><><> <><><><> <><><><> <><><><> */

	/**
	 * Detect an area of effect type and size from raw description text.
	 * Used as a fallback when the Range line provides no template data, and also to
	 * supplement it with secondary dimensions (e.g. width for lines, height for cylinders).
	 * Patterns are checked in priority order; the first match wins.
	 * Type strings are resolved against CONFIG.BlackFlag.areaOfEffectTypes.localized,
	 * consistent with the lookup used by consumeRange().
	 * @param {string} text - Raw description text to scan.
	 * @returns {{ size: number, type: string, unit: string, height?: number, width?: number }|null}
	 */
	static parseAOEFromText(text) {
		const findType = shape =>
			Object.entries(CONFIG.BlackFlag.areaOfEffectTypes.localized).find(
				([, v]) => v.toLowerCase() === shape.toLowerCase()
			)?.[0] ?? null;
		const scanHeight = ctx => {
			const m = ctx.match(/(\d+)[-\s]?(?:foot|feet|ft)[^.]{0,5}?(?:high|tall)/i);
			return m ? Number(m[1]) : null;
		};
		const scanWidth = ctx => {
			const m = ctx.match(/(\d+)[-\s]?(?:foot|feet|ft)[^.]{0,5}?(?:wide|thick)/i);
			return m ? Number(m[1]) : null;
		};
		// Extend context past the match end to capture secondary dimensions that follow.
		const extCtx = m => m[0] + text.substring(m.index + m[0].length, m.index + m[0].length + 100);

		let m;

		// C1: cylinder, radius-first (e.g. "30-foot-radius, 60-foot-high cylinder")
		m = text.match(/(\d+)[-\s]?(?:foot|feet|ft)[-\s]?radius[^.]{0,40}?cylinder/i);
		if (m) {
			const type = findType("cylinder");
			if (type) {
				const result = { size: Number(m[1]), type, unit: "foot" };
				const height = scanHeight(extCtx(m));
				if (height !== null) result.height = height;
				return result;
			}
		}

		// C2: cylinder, shape-first (e.g. "cylinder that is 10 feet tall with a 20-foot radius")
		m = text.match(/cylinder[^.]{0,80}?(\d+)[-\s]?(?:foot|feet|ft)[-\s]?radius/i);
		if (m) {
			const type = findType("cylinder");
			if (type) {
				const result = { size: Number(m[1]), type, unit: "foot" };
				const height = scanHeight(extCtx(m));
				if (height !== null) result.height = height;
				return result;
			}
		}

		// P1: radius + sphere or circle (e.g. "20-foot-radius sphere")
		m = text.match(/(\d+)[-\s]?(?:foot|feet|ft)[-\s]?radius\s+(sphere|circle)/i);
		if (m) {
			const type = findType(m[2]);
			if (type) return { size: Number(m[1]), type, unit: "foot" };
		}

		// P2: size + shape — cone, cube, square only (cylinder/line/wall handled separately)
		m = text.match(/(\d+)[-\s]?(?:foot|feet|ft)[-\s]?(cone|cube|square)/i);
		if (m) {
			const type = findType(m[2]);
			if (type) return { size: Number(m[1]), type, unit: "foot" };
		}

		// P4 (wall) before P3 (line): wall descriptions often use "in a line … long" for
		// their geometry, which would otherwise trigger P3 prematurely.
		// P4: wall, shape-first (e.g. "wall…90 feet long, 30 feet high, and 50 feet thick")
		m = text.match(/\bwall\b[^.]{0,80}?(\d+)[-\s]?(?:foot|feet|ft)[^.]{0,10}?(?:long|in length)/i);
		if (m) {
			const type = findType("wall");
			if (type) {
				const result = { size: Number(m[1]), type, unit: "foot" };
				const ctx = extCtx(m);
				const height = scanHeight(ctx);
				const width = scanWidth(ctx);
				if (height !== null) result.height = height;
				if (width !== null) result.width = width;
				return result;
			}
		}

		// P3: line, shape-first (e.g. "a line 60 feet long and 10 feet wide")
		m = text.match(/\bline\b[^.]{0,80}?(\d+)[-\s]?(?:foot|feet|ft)[^.]{0,10}?(?:long|in length)/i);
		if (m) {
			const type = findType("line");
			if (type) {
				const result = { size: Number(m[1]), type, unit: "foot" };
				const width = scanWidth(extCtx(m));
				if (width !== null) result.width = width;
				return result;
			}
		}

		// P5: standalone radius with no explicit shape (e.g. "20-foot radius")
		m = text.match(/(\d+)[-\s]?(?:foot|feet|ft)[-\s]?radius\b/i);
		if (m) {
			const type = findType("radius");
			if (type) return { size: Number(m[1]), type, unit: "foot" };
		}

		return null;
	}

	static enrichers = [
		// Skills
		{
			regex: /DC\s+(?<dc>\d+)\s+(?<ability>\w+)\s+\((?<skill>[\w\s]+)\)\s+check/dgi,
			handler: result => {
				const { ability, dc, skill } = result.groups;
				if (!(ability.toLowerCase() in CONFIG.BlackFlag.enrichment.lookup.abilities)) return false;
				if (!(skill.toLowerCase() in CONFIG.BlackFlag.enrichment.lookup.skills)) return false;
				return `[[/check ${dc} ${ability} (${skill})]]`;
			}
		},

		// Ability Checks
		{
			regex: /DC\s+(?<dc>\d+)\s+(?<ability>\w+)\s+check/dgi,
			handler: result => {
				const { ability, dc } = result.groups;
				if (!(ability.toLowerCase() in CONFIG.BlackFlag.enrichment.lookup.abilities)) return false;
				return `[[/check ${dc} ${ability}]]`;
			}
		},

		// Ability Saves
		{
			regex: /DC\s+(?<dc>\d+)\s+(?<ability>\w+)\s+save/dgi,
			handler: result => {
				const { ability, dc } = result.groups;
				if (!(ability.toLowerCase() in CONFIG.BlackFlag.enrichment.lookup.abilities)) return false;
				return `[[/save ${dc} ${ability}]]`;
			}
		},

		// Conditions — match when preceded by a contextual verb phrase to prevent false
		// positives on bare condition names. apply=false suppresses the "apply condition"
		// button; conditions here are described, not triggered.
		{
			regex:
				// eslint-disable-next-line max-len
				/\b(?:is|are|becomes?|while|be|fall(?:ing)?|knocked|also|or|and)\s+(blinded|charmed|deafened|frightened|grappled|incapacitated|invisible|paralyzed|petrified|poisoned|prone|restrained|stunned|unconscious)\b/dgi,
			handler: result => {
				const conditionName = result[1];
				const verbPhrase = result[0].slice(0, result[0].toLowerCase().lastIndexOf(conditionName.toLowerCase()));
				return `${verbPhrase}&Reference[${conditionName.toLowerCase()} apply=false]`;
			}
		},

		// Difficult terrain — matched standalone without a verb trigger since the phrase
		// is specific enough to always be a terrain reference. No apply=false (not a condition).
		{
			regex: /\bdifficult terrain\b/dgi,
			handler: () => "&Reference[difficult terrain]"
		},

		// Actions — match action names following "take/use the … action" or "for … action".
		// A non-capturing skip group allows non-action items at the start of the list
		// (e.g. "Attack (one weapon attack only), Dash, Disengage…") without consuming
		// the action names. Handles single names, pairs, and Oxford-comma/and lists.
		{
			regex:
				// eslint-disable-next-line max-len
				/\b(?:(?:takes?|uses?)\s+the\s+|for\s+)(?:(?!Dash|Disengage|Dodge|Help|Hide|Ready|Search|Use an Object)[^,]+,\s*)*((?:Dash|Disengage|Dodge|Help|Hide|Ready|Search|Use an Object)(?:(?:\s*,\s*(?:(?:or|and)\s+)?|\s+(?:or|and)\s+)(?:Dash|Disengage|Dodge|Help|Hide|Ready|Search|Use an Object))*)\s+action/dgi,
			handler: result => {
				const enrichedList = result[1].replace(
					/Dash|Disengage|Dodge|Help|Hide|Ready|Search|Use an Object/gi,
					name => `&Reference[${name}]`
				);
				return result[0].replace(result[1], enrichedList);
			}
		},

		// Damage
		{
			regex: /(?<roll>\d+d\d+(?:\s+[+|-|−]\s+\d+)?)\s+(?<type>\w+)\sdamage/dgi,
			handler: result => {
				const { roll, type } = result.groups;
				if (!(type.toLowerCase() in CONFIG.BlackFlag.damageTypes)) return false;
				return `[[/damage ${roll} ${type}]]`;
			}
		},

		// Other Roll
		{
			regex: /(\d+d\d+(?:\s+[+|-|−]\s+\d+)?)/dgi,
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
		for (const { regex, handler } of Parser.enrichers) {
			let match;
			const keys = [];
			while ((match = regex.exec(paragraph)) !== null) {
				const newValue = handler(match);
				if (newValue) {
					const key = `$$${count}$$`;
					replacements.push({ key, newValue });
					keys.unshift({ key, indices: match.indices[0] });
					count++;
				}
			}
			for (const { key, indices } of keys) {
				paragraph = paragraph.substring(0, indices[0]) + key + paragraph.substring(indices[1]);
			}
		}
		for (const { key, newValue } of replacements) {
			paragraph = paragraph.replace(key, newValue);
		}
		return paragraph;
	}
}
