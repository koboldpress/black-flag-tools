export function convertSpellSchool(initial) {
	return (
		{
			abj: "abjuration",
			con: "conjuration",
			div: "divination",
			enc: "enchantment",
			evo: "evocation",
			ill: "illusion",
			enc: "necromancy",
			trs: "transmutation"
		}[initial] ?? initial
	);
}
