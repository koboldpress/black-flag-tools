export function convertDamageType(initial) {
	return (
		{
			temphp: "temp"
		}[initial] ?? initial
	);
}
