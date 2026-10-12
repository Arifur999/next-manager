import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import pluginQuery from "@tanstack/eslint-plugin-query";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Logs go through src/lib/logger.ts, which never prints tokens or raw errors.
  { rules: { "no-console": "error" } },
  { files: ["src/lib/logger.ts", "scripts/**"], rules: { "no-console": "off" } },
  ...pluginQuery.configs["flat/recommended"],
  // Query keys come from src/lib/queryKeys.ts through the builders in src/queries.
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/lib/queryKeys.ts", "src/queries/**"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Property[key.name='queryKey'] > ArrayExpression",
          message: "Use a builder from src/queries or a key from queryKeys instead of an inline query key.",
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // The verification build's output (see distDir in next.config.ts). Same
    // generated code as .next, just under the name `npm run verify` gives it -
    // so leaving it out meant one verify run buried src's own results under a
    // few hundred problems in machine-written files, and lint stopped being
    // worth reading. It also breaks outright between runs: eslint enumerates
    // the directory, then fails with ENOENT when the next build replaces a
    // chunk mid-lint.
    ".next-check/**",
  ]),
]);

export default eslintConfig;
