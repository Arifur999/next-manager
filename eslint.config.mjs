import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
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
