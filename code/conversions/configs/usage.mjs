export function convertConsumptionTypes(initial) {
	return (
		{
			ammo: "",
			attribute: "",
			material: "item",
			charges: "item"
		}[initial] ?? initial
	);
}

export function convertRecoveryPeriods(initial) {
	return (
		{
			lr: "longRest",
			sr: "shortRest",
			day: "longRest",
			dawn: "longRest",
			dusk: "longRest"
		}[initial] ?? initial
	);
}
