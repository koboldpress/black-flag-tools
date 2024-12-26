import BaseConversion from "./base.mjs";
import { TOOLS } from "../utils.mjs";

export function selectConverter(type, data) {
	return TOOLS.DOCUMENT_TYPES[type]?.selectConverter?.(data) ?? BaseConversion;
}
