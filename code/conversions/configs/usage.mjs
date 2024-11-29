export function convertConsumptionTypes(initial) {
	return (
		{
			activityUses: "activity",
			ammo: "",
			itemUses: "item",
			material: "item"
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
