export function convertWeapon(initial) {
	return initial
		.replace(/^sim/, "simple")
		.replace(/^mar/, "martial")
		.replace(/handcrossbow$/, "handCrossbow")
		.replace(/heavycrossbow$/, "heavyCrossbow")
		.replace(/lightcrossbow$/, "lightCrossbow")
		.replace(/lighthammer$/, "lightHammer");
}

export function convertWeaponCategory(initial) {
	return (
		{
			martialM: "martial",
			martialR: "martial",
			simpleM: "simple",
			simpleR: "simple"
		}[initial] ?? initial
	);
}

export function convertWeaponType(initial) {
	return (
		{
			martialM: "melee",
			martialR: "ranged",
			simpleM: "melee",
			simpleR: "ranged"
		}[initial] ?? initial
	);
}
