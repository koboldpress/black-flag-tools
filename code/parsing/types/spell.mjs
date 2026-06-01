import Parser from "../parser.mjs";

export default async function parseSpell(type, input) {
	let data = { type, "system.tags": [] };
	const parser = new Parser(input);

	// Name
	data.name = parser.consumeLine();

	// Circle
	const circle = parser.consumeRegex(/(\d)\w{2}[-| ]Circle\s*/i);
	data["system.circle.base"] = circle?.[1] ?? 0;

	// Source
	const regex = new RegExp(
		`((?:(?:${Object.values(CONFIG.BlackFlag.spellSources.localized).join("|")}|and),?\\s+)+)(?:\\(|Cantrip\\s*|(?<ritual>Ritual\\s*)?)`,
		"i"
	);
	const sourceMatch = parser.consumeRegex(regex);
	let sources = sourceMatch?.[1].trim().replace(",", "").split(" ");
	data["system.source"] = sources
		?.map(
			source =>
				Object.entries(CONFIG.BlackFlag.spellSources.localized).find(
					([k, v]) => v.toLowerCase() === source.toLowerCase()
				)?.[0]
		)
		.filter(_ => _);
	if (sourceMatch?.groups?.ritual) data["system.tags"].push("ritual");

	// School
	parser.consumeIfMatches("\\(");
	data["system.school"] = parser.consumeEnum(CONFIG.BlackFlag.spellSchools.localized);
	parser.consumeLine();

	// Other Details
	data["system.casting"] = parser.consumeCasting();
	const { range, template } = parser.consumeRange() ?? {};
	data["system.range"] = range;
	data["system.target.template"] = template;
	data["system.components"] = parser.consumeComponents();
	const { duration, concentration } = parser.consumeDuration() ?? {};
	data["system.duration"] = duration;
	if (concentration) data["system.tags"].push("concentration");

	// Description
	data["system.description.value"] = parser.consumeDescription({
		process: (paragraph, index) => {
			// First paragraph is the spell's short description
			if (index === 0) {
				// Store the plain-text first paragraph as the short description
				data["system.description.short"] = paragraph;
				// Retain it in the body, set off as a blockquote (≤25 words) or em (longer)
				paragraph =
					paragraph.split(/\s+/).length <= 25 ? `<blockquote>${paragraph}</blockquote>` : `<em>${paragraph}</em>`;
			}

			// Emphasize "At Higher Circles"
			if (/^\s*At Higher Circles\./i.test(paragraph)) {
				paragraph = paragraph.replace("At Higher Circles.", "<strong><em>At Higher Circles.</em></strong>");
			}

			return paragraph;
		}
	});

	return new Item.implementation(foundry.utils.expandObject(data));
}
