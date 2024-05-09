export function convertDistanceUnits(initial) {
	return {
		ft: "foot",
		mi: "mile"
	}[initial] ?? [initial];
}
