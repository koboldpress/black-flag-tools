export function convertActivationType(initial) {
	return (
		{
			none: "free"
		}[initial] ?? initial
	);
}

export function convertTimePeriod(initial) {
	return (
		{
			disp: "dispelled",
			dstr: "triggered",
			perm: "permanent",
			inst: "instantaneous",
			spec: "special"
		}[initial] ?? initial
	);
}
