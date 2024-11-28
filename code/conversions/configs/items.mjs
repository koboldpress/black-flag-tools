export function convertConsumableCategory(initial) {
	return {}[initial] ?? initial;
}

export function convertFeatureCategory(initial) {
	return (
		{
			race: "lineage"
		}[initial] ?? initial
	);
}

export function convertFeatureType(initial) {
	return {}[initial] ?? initial;
}

export function convertGearCategory(initial) {
	return (
		{
			trinket: "wondrousItem"
		}[initial] ?? initial
	);
}

export function convertGearType(initial) {
	return {}[initial] ?? initial;
}

export function convertItemProperty(initial) {
	return (
		{
			amm: "ammunition",
			fin: "finesse",
			hvy: "heavy",
			lgt: "light",
			lod: "loading",
			mgc: "magical",
			rch: "reach",
			stealthDisadvantage: "noisy",
			thr: "thrown",
			two: "twoHanded",
			ver: "versatile"
		}[initial] ?? initial
	);
}

export function convertSundryCategory(initial) {
	return (
		{
			art: "treasure",
			gear: "clothing",
			gem: "treasure",
			junk: "trinket",
			material: "component",
			resource: "tradeGood",
			treasure: "treasure"
		}[initial] ?? initial
	);
}
