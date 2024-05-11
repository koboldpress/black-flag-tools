export function convertWeapon(initial) {
	return initial
		.replace(/^sim/, "simple")
		.replace(/^mar/, "martial")
		.replace(/handcrossbow$/, "handCrossbow")
		.replace(/heavycrossbow$/, "heavyCrossbow")
		.replace(/lightcrossbow$/, "lightCrossbow")
		.replace(/lighthammer$/, "lightHammer");
}
