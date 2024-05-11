export function convertSize(initial) {
	return {
		sm: "small",
		med: "medium",
		lg: "large",
		grg: "gargantuan",
	}[initial] ?? initial;
}
