import path from "path";
import postcss from "rollup-plugin-postcss";

export default {
	input: "code/_module.mjs",
	output: {
		file: "black-flag-tools.mjs",
		format: "es",
		sourcemap: true
	},
	plugins: [
		postcss({
			extract: path.resolve("black-flag-tools.css")
		})
	],
	external: []
};
