export default class ConversionError extends Error {
	constructor(...args) {
		super(...args);
		this.name = "ConversionError";
	}
}
