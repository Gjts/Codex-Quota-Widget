import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  {
    ignores: ["dist", "node_modules", "src-tauri/target", "src-tauri/gen"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // TypeScript already reports undefined identifiers, so `no-undef`
      // only produces false positives for browser / node / vitest globals.
      "no-undef": "off",
      // Allow the self-clearing-interval pattern: a `let` captured by a
      // closure before the timer id is assigned to it.
      "prefer-const": ["error", { ignoreReadBeforeAssign: true }],
    },
  },
  {
    files: ["**/*.tsx"],
    plugins: { "react-refresh": reactRefresh },
    rules: {
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
  {
    // Vitest's config uses the official `/// <reference>` types directive.
    files: ["**/*.config.ts"],
    rules: { "@typescript-eslint/triple-slash-reference": "off" },
  },
  // Disable stylistic rules that conflict with Prettier (formatting is owned
  // by `pnpm format`, not ESLint).
  prettier,
);
