export function convertTool(initial) {
	return initial
		.replace(/^art/, "artisan")
		.replace(/^game/, "gaming")
		.replace(/^music/, "musicalInstrument")
		.replace(/card$/, "playingCard")
		.replace(/disg$/, "disguiseKit")
		.replace(/herb$/, "herbalism")
		.replace(/pois$/, "poisonersKit")
		.replace(/thief$/, "thievesTools");
}
