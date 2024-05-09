export function convertFeatureCategory(initial) {
	return {
		race: "lineage"
	}[initial] ?? initial;
}

export function convertFeatureType(initial) {
	return {
		
	}[initial] ?? initial;
}
