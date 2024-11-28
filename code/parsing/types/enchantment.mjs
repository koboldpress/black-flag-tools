import Parser from "../parser.mjs";

export default async function parseEnchantment(type, input) {
	let data = { type: "feature" };
	const parser = new Parser(input);

	// Name
	data.name = parser.consumeLine();

	const effect = {
		id: foundry.utils.randomID(),
		type: "enchantment",
		name: data.name,
		disabled: true,
		changes: []
	};

	let tagline = parser.remainder;

	// Retrieve item data
	const typeResult = parser.consumeRegex(/(?<type>Armor|Weapon)\s+\((?<details>[^)]+)\),?\s*/i);
	const rarity = parser.consumeEnum(CONFIG.BlackFlag.rarities.localized);
	let attunement = parser.consumeAttunement();
	const price = parser.consumeCost();
	const plusBaseCost = parser.consumeRegex(/\s*\+\s+(?:ammunition|armor|shield|weapon)\s+base\s+cost\s*/i);
	if ( !attunement ) attunement = parser.consumeAttunement();
	tagline = tagline.replace(parser.remainder, "");
	const description = data["system.description.value"] = parser.consumeDescription();

	// Name
	let effectName = `${data.name} {}`;
	if ( data.name.includes(typeResult?.groups.type) ) effectName = data.name.replace(typeResult?.groups.type, "{}");
	else if ( typeResult?.groups.details?.includes("Any") ) {
		const part = typeResult.groups.details.replace("Any", "").trim();
		if ( data.name.includes(part) ) effectName = data.name.replace(part, "{}");
	}
	effect.changes.push({ key: "name", mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: effectName });

	// Description
	data["system.description.value"] += `
		<section class="secret" id="secret-${foundry.utils.randomID()}">
			<p><strong>Foundry Note</strong></p>
			<p><em>${tagline}</em></p>
			<p>
				Create the final magic item by selection the appropriate mundane item and
				dragging an enchantment from the <q>Advancement & Effects</q> tab to that item.
			</p>
		</section>
	`;
	effect.changes.push({ key: "system.description.value", mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: description });

	// Attunement
	if ( attunement ) Object.entries(attunement).forEach(([key, value]) => effect.changes.push({
		key: `system.attunement.${key}`, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value
	}));

	// Price
	if ( price ) effect.changes.push(
		{ key: "system.price.value", mode: CONST.ACTIVE_EFFECT_MODES[plusBaseCost ? "ADD" : "OVERRIDE"], value: price },
		{ key: "system.price.denomination", mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: "gp" }
	);

	// Magical Property
	effect.changes.push({ key: "system.properties", mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: "magical" });

	// Rarity
	if ( rarity ) effect.changes.push({ key: "system.rarity", mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: rarity });

	data.effects = [effect];

	return new Item.implementation(foundry.utils.expandObject(data));
}
