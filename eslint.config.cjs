const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  {
    ignores: [
      "node_modules/**",
      "build/**",
      "src/**",
      "bindings/**",
      "scripts/*",
      "!scripts/generate-parser.js",
      "grammar.js",
      "test-npm-package/**",
    ],
  },
  js.configs.recommended,
  { languageOptions: { sourceType: "commonjs", globals: globals.node } },
];
