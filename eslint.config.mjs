import jsdoc from "eslint-plugin-jsdoc";
import globals from "globals";

export default [
	{
		plugins: {
			jsdoc
		},

		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
				...globals.jquery
			},

			ecmaVersion: "latest",
			sourceType: "module",

			parserOptions: {
				requireConfigFile: false
			}
		},

		settings: {
			jsdoc: {
				mode: "typescript",

				preferredTypes: {
					".<>": "<>"
				},

				tagNamePreference: {
					auguments: "extends"
				}
			}
		},

		rules: {
			"array-callback-return": "warn",
			"constructor-super": "error",
			"default-param-last": "warn",
			eqeqeq: ["warn", "smart"],
			"func-names": ["warn", "never"],

			"getter-return": [
				"warn",
				{
					allowImplicit: true
				}
			],

			"lines-between-class-members": "warn",
			"no-alert": "warn",
			"no-array-constructor": "warn",
			"no-class-assign": "warn",
			"no-compare-neg-zero": "warn",
			"no-cond-assign": "warn",
			"no-const-assign": "error",
			"no-constant-condition": "warn",
			"no-constructor-return": "warn",
			"no-delete-var": "warn",
			"no-dupe-args": "warn",
			"no-dupe-class-members": "warn",
			"no-dupe-keys": "warn",
			"no-duplicate-case": "warn",

			"no-duplicate-imports": [
				"warn",
				{
					includeExports: true
				}
			],

			"no-empty": [
				"warn",
				{
					allowEmptyCatch: true
				}
			],

			"no-empty-character-class": "warn",
			"no-empty-pattern": "warn",
			"no-func-assign": "warn",
			"no-global-assign": "warn",

			"no-implicit-coercion": [
				"warn",
				{
					allow: ["!!"]
				}
			],

			"no-implied-eval": "warn",
			"no-import-assign": "warn",
			"no-invalid-regexp": "warn",
			"no-irregular-whitespace": "warn",
			"no-iterator": "warn",
			"no-lone-blocks": "warn",
			"no-lonely-if": "warn",
			"no-misleading-character-class": "warn",
			"no-multi-str": "warn",
			"no-new-func": "warn",
			"no-new-object": "warn",
			"no-new-symbol": "warn",
			"no-new-wrappers": "warn",
			"no-nonoctal-decimal-escape": "warn",
			"no-obj-calls": "warn",
			"no-octal": "warn",
			"no-octal-escape": "warn",
			"no-promise-executor-return": "warn",
			"no-proto": "warn",
			"no-regex-spaces": "warn",
			"no-script-url": "warn",
			"no-self-assign": "warn",
			"no-self-compare": "warn",
			"no-setter-return": "warn",
			"no-sequences": "warn",
			"no-template-curly-in-string": "warn",
			"no-this-before-super": "error",
			"no-unexpected-multiline": "warn",
			"no-unmodified-loop-condition": "warn",
			"no-unneeded-ternary": "warn",
			"no-unreachable": "warn",
			"no-unreachable-loop": "warn",

			"no-unsafe-negation": [
				"warn",
				{
					enforceForOrderingRelations: true
				}
			],

			"no-unsafe-optional-chaining": [
				"warn",
				{
					disallowArithmeticOperators: true
				}
			],

			"no-unused-expressions": "warn",
			"no-useless-backreference": "warn",
			"no-useless-call": "warn",
			"no-useless-catch": "warn",

			"no-useless-computed-key": [
				"warn",
				{
					enforceForClassMembers: true
				}
			],

			"no-useless-concat": "warn",
			"no-useless-constructor": "warn",
			"no-useless-rename": "warn",
			"no-useless-return": "warn",
			"no-var": "warn",
			"no-void": "warn",
			"prefer-numeric-literals": "warn",
			"prefer-object-spread": "warn",
			"prefer-regex-literals": "warn",
			"prefer-spread": "warn",
			"symbol-description": "warn",
			"unicode-bom": ["warn", "never"],

			"use-isnan": [
				"warn",
				{
					enforceForSwitchCase: true,
					enforceForIndexOf: true
				}
			],

			"valid-typeof": [
				"warn",
				{
					requireStringLiterals: true
				}
			],

			"capitalized-comments": [
				"warn",
				"always",
				{
					ignoreConsecutiveComments: true
				}
			],

			"dot-notation": "warn",

			"max-len": [
				"warn",
				{
					code: 120,
					tabWidth: 2,
					ignoreTrailingComments: true,
					ignoreUrls: true,
					ignoreStrings: true,
					ignoreTemplateLiterals: true
				}
			],

			"no-extra-boolean-cast": [
				"warn",
				{
					enforceForLogicalOperands: true
				}
			],

			"no-tabs": [
				"warn",
				{
					allowIndentationTabs: true
				}
			],

			"no-throw-literal": "error",
			"no-useless-escape": "warn",

			"no-unused-vars": [
				"warn",
				{
					args: "none"
				}
			],

			"one-var": ["warn", "never"],
			"prefer-template": "warn",

			quotes: [
				"warn",
				"double",
				{
					avoidEscape: true,
					allowTemplateLiterals: false
				}
			],

			"spaced-comment": "warn",
			"jsdoc/check-access": "warn",
			"jsdoc/check-alignment": "warn",
			"jsdoc/check-examples": "off",
			"jsdoc/check-indentation": "off",
			"jsdoc/check-line-alignment": "off",
			"jsdoc/check-param-names": "warn",
			"jsdoc/check-property-names": "warn",
			"jsdoc/check-syntax": "off",
			"jsdoc/check-tag-names": "warn",
			"jsdoc/check-types": "warn",
			"jsdoc/check-values": "warn",
			"jsdoc/empty-tags": "warn",
			"jsdoc/implements-on-classes": "warn",
			"jsdoc/match-description": "off",
			"jsdoc/newline-after-description": "off",
			"jsdoc/no-bad-blocks": "warn",
			"jsdoc/no-defaults": "off",
			"jsdoc/no-types": "off",
			"jsdoc/no-undefined-types": "off",
			"jsdoc/require-description": "warn",
			"jsdoc/require-description-complete-sentence": "off",
			"jsdoc/require-example": "off",
			"jsdoc/require-file-overview": "off",
			"jsdoc/require-hyphen-before-param-description": ["warn", "always"],
			"jsdoc/require-jsdoc": "warn",
			"jsdoc/require-param": "warn",
			"jsdoc/require-param-description": "off",
			"jsdoc/require-param-name": "warn",
			"jsdoc/require-param-type": "warn",
			"jsdoc/require-property": "warn",
			"jsdoc/require-property-description": "off",
			"jsdoc/require-property-name": "warn",
			"jsdoc/require-property-type": "warn",
			"jsdoc/require-returns": "warn",
			"jsdoc/require-returns-check": "warn",
			"jsdoc/require-returns-description": "off",
			"jsdoc/require-returns-type": "warn",
			"jsdoc/require-throws": "off",
			"jsdoc/require-yields": "warn",
			"jsdoc/require-yields-check": "warn",
			"jsdoc/valid-types": "off"
		}
	}
];