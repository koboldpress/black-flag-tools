export function convertAreaOfEffectType(initial) {
	return {}[initial] ?? initial;
}

export function convertRangeType(initial) {
	return (
		{
			spec: "special"
		}[initial] ?? initial
	);
}

export function convertTargetType(initial) {
	return (
		{
			any: "",
			creatureOrObject: "creatureObject",
			self: "",
			space: ""
		}[initial] ?? initial
	);
}
