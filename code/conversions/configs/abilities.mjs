export function convertAbility(initial) {
	return {
		str: "strength",
		dex: "dexterity",
		con: "constitution",
		int: "intelligence",
		wis: "wisdom",
		cha: "charisma"
	}[initial] ?? initial;
}
