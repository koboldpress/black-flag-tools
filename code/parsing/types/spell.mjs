import Parser from "../parser.mjs";

export default async function parseSpell(type, input) {
	let data = { type };
	const parser = new Parser(input);

	// Name
	data.name = parser.consumeLine();

	// Circle
	const circle = parser.consumeRegex(/(\d)\w{2}[-| ]Circle\s*/i);
	data["system.circle.base"] = circle?.[1] ?? 0;

	// Source
	const regex = new RegExp(
		`((?:(?:${Object.values(CONFIG.BlackFlag.spellSources.localized).join("|")}|and),?\\s+)+)(?:\\(|Cantrip\\s*)`, "i"
	);
	let sources = parser.consumeRegex(regex)?.[1].trim().replace(",", "").split(" ");
	data["system.source"] = sources?.map(source =>
		Object.entries(CONFIG.BlackFlag.spellSources.localized)
			.find(([k, v]) => v.toLowerCase() === source.toLowerCase())?.[0]
	).filter(_ => _);

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
	data["system.duration"] = parser.consumeDuration();

	// Description
	data["system.description.value"] = parser.consumeDescription({ process: (paragraph, index) => {
		// Highlight first paragraph as long as it is less than 20 words
		if ( index === 0 && paragraph.split(" ").length < 20  ) {
			paragraph = `<em>${paragraph}</em>`
		}

		// Emphasize "At Higher Circles"
		if ( /^\s*At Higher Circles\./i.test(paragraph) ) {
			paragraph = paragraph.replace("At Higher Circles.", "<strong><em>At Higher Circles.</em></strong>");
		}

		return paragraph;
	} });

	return new Item.implementation(foundry.utils.expandObject(data));
}
