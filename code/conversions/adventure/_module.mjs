import BaseConversion from "../base.mjs";

export default class AdventureConversion extends BaseConversion {
	static convertBase(initial, context) {
		return super.convertBase(initial, { ...context, adventure: initial });
	}
}
