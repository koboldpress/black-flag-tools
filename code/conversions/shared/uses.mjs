import { convertRecoveryPeriods } from "../configs/usage.mjs";

export function convertUsesRecovery(initial) {
	return initial?.map(i => ({
		period: convertRecoveryPeriods(i.period),
		type: i.type,
		formula: i.formula
	}));
}
