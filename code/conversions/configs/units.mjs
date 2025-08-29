/**
 * Convert a distance unit from dnd5e to those used by Black Flag.
 * @param {string} initial
 * @returns {string}
 */
export function convertDistanceUnit(initial) {
	return (
		{
			ft: "foot",
			mi: "mile",
			m: "meter",
			km: "kilometer"
		}[initial] ?? initial
	);
}

/**
 * Convert a volume unit from dnd5e to those used by Black Flag.
 * @param {string} initial
 * @returns {string}
 */
export function convertVolumeUnit(initial) {
	return {}[initial] ?? initial;
}

/**
 * Convert a weight unit from dnd5e to those used by Black Flag.
 * @param {string} initial
 * @returns {string}
 */
export function convertWeightUnit(initial) {
	return (
		{
			lb: "pound",
			tn: "ton",
			kg: "kilogram",
			Mg: "megagram"
		}[initial] ?? initial
	);
}
