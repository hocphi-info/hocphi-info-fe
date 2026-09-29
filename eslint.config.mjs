import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  eslintConfigPrettier,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Output of `opennextjs-cloudflare build` (thousands of generated files).
    ".open-next/**",
    // Generated from the BE's openapi.json by `npm run gen:api` — never hand-edited.
    "src/types/api.gen.ts",
  ]),
]);

export default eslintConfig;
