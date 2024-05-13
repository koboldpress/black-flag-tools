export function convertDistanceUnits(initial) {
	return {
		ft: "foot",
		mi: "mile"
	}[initial] ?? [initial];
}

export function convertWeightUnits(initial) {
	return {
		lb: "pound",
		tn: "ton",
		kg: "kilogram",
		Mg: "megagram"
	}[initial] ?? [initial];
}
