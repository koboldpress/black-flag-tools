const postcssPresetEnv = require("postcss-preset-env");

module.exports = {
	plugins: [
		require("postcss-import"),
		postcssPresetEnv({
			features: {
				"cascade-layers": false,
				"custom-properties": false,
				"is-pseudo-class": false,
				"logical-properties-and-values": false,
				"nesting-rules": false
			}
		})
	]
};
