export function convertSkill(initial) {
	return {
		acr: "acrobatics",
		ani: "animalHandling",
		arc: "arcana",
		ath: "athletics",
		dec: "deception",
		his: "history",
		ins: "insight",
		itm: "intimidation",
		inv: "investigation",
		med: "medicine",
		nat: "nature",
		prc: "perception",
		prf: "performance",
		per: "persuasion",
		rel: "religion",
		slt: "sleightOfHand",
		ste: "stealth",
		sur: "survival",
	}[initial] ?? initial;
}
