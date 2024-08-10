export function convertDistanceUnit(initial) {
	return {
		ft: "foot",
		mi: "mile"
	}[initial] ?? initial;
}

export function convertWeightUnit(initial) {
	return {
		lb: "pound",
		tn: "ton",
		kg: "kilogram",
		Mg: "megagram"
	}[initial] ?? initial;
}
