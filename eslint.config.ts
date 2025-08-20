import globals from "globals";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import js from "@eslint/js";

export default [
  // base JS rules
  js.configs.recommended,

  // Vue 3 + SFC support
  ...pluginVue.configs["flat/essential"],

  // TS rules (with/without type-checking)
  ...tseslint.configs.recommended,

  {
    files: ["**/*.{ts,tsx,vue}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module"
        // If you later want type-aware rules, add:
        // project: ["./tsconfig.json"]
      },
      globals: {
        ...globals.browser
      }
    },
    rules: {
      // your custom rules here
    }
  },

  // Test files: Vitest globals
  {
    files: ["**/*.spec.ts", "**/*.test.ts"],
    languageOptions: {
      globals: {
        ...globals.browser,
        // Vitest globals (editor only)
        describe: true,
        it: true,
        expect: true
      }
    }
  }
];
