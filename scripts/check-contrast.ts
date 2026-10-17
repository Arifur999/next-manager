// scripts/check-contrast.ts
// Checks the token pairs in src/app/globals.css (light and dark) against WCAG ratios before any page exists.
// Resolves var() chains and composites alpha tokens over --background. Exit code 1 on any failure.
// From knowledge-base/design/05-design-system-implementation.md section 12. console.log is fine: scripts/ is outside src/.
import { readFileSync } from "node:fs";
import { converter, parse, wcagContrast, type Rgb } from "culori";

const css = readFileSync("src/app/globals.css", "utf8");
const toRgb = converter("rgb");

const readBlocks = (selector: string) => {
  const vars: Record<string, string> = {};
  const re = new RegExp(`(?:^|\\n)\\s*${selector}\\s*\\{([^}]*)\\}`, "g");
  for (const block of css.matchAll(re)) {
    for (const m of (block[1] ?? "").matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) vars[m[1]!] = m[2]!.trim();
  }
  return vars;
};

const light = readBlocks(":root");
const dark = { ...light, ...readBlocks("\\.dark") };

const resolve = (vars: Record<string, string>, name: string, depth = 0): string => {
  const raw = vars[name];
  if (!raw || depth > 10) throw new Error(`Unresolved token ${name}`);
  const ref = raw.match(/^var\((--[\w-]+)\)$/);
  return ref ? resolve(vars, ref[1]!, depth + 1) : raw;
};

const flatten = (fg: Rgb, bg: Rgb): Rgb => {
  const a = fg.alpha ?? 1;
  return { mode: "rgb", r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a) };
};

const color = (vars: Record<string, string>, name: string): Rgb => {
  const parsed = toRgb(parse(resolve(vars, name)));
  if (!parsed) throw new Error(`Cannot parse ${name}`);
  const page = toRgb(parse(resolve(vars, "--background")));
  if (!page) throw new Error("Cannot parse --background");
  return flatten(parsed, page);
};

// [foreground, background, minimum ratio]. Add a pair for every new semantic color.
const PAIRS: Array<[string, string, number]> = [
  ["--foreground", "--background", 4.5],
  ["--muted-foreground", "--background", 4.5],
  ["--muted-foreground", "--muted", 4.5],
  ["--card-foreground", "--card", 4.5],
  ["--primary-foreground", "--primary", 4.5],
  ["--primary-strong", "--background", 4.5],
  ["--secondary-foreground", "--secondary", 4.5],
  ["--destructive-foreground", "--destructive", 4.5],
  ["--success-foreground", "--success", 4.5],
  ["--warning-foreground", "--warning", 4.5],
  ["--info-foreground", "--info", 4.5],
  ["--destructive-subtle-foreground", "--destructive-subtle", 4.5],
  ["--success-subtle-foreground", "--success-subtle", 4.5],
  ["--warning-subtle-foreground", "--warning-subtle", 4.5],
  ["--info-subtle-foreground", "--info-subtle", 4.5],
  ["--sidebar-foreground", "--sidebar", 4.5],
  ["--muted-foreground", "--card", 4.5],
  ["--muted-foreground", "--sidebar", 4.5],
  ["--primary-strong", "--card", 4.5],
  ["--accent-foreground", "--accent", 4.5],
  ["--marker-foreground", "--marker", 4.5],
  ["--band-foreground", "--band", 7],
  ["--band", "--band-foreground", 4.5],
  ["--primary", "--background", 3],
  ["--destructive", "--background", 4.5],
  ["--destructive", "--card", 4.5],
  // MetricTile figures that carry a verdict (large text, so 3:1 would do).
  ["--success", "--card", 4.5],
  ["--warning-subtle-foreground", "--card", 4.5],
  ["--ring", "--background", 3],
  ["--chart-1", "--card", 3],
  ["--chart-2", "--card", 3],
  ["--chart-3", "--card", 3],
  ["--chart-4", "--card", 3],
  ["--chart-5", "--card", 3],
];

let failures = 0;
for (const [theme, vars] of [["light", light], ["dark", dark]] as const) {
  console.log(`\n${theme}`);
  for (const [fg, bg, min] of PAIRS) {
    const ratio = wcagContrast(color(vars, fg), color(vars, bg));
    const ok = ratio >= min;
    if (!ok) failures++;
    console.log(`${ok ? "ok  " : "FAIL"} ${ratio.toFixed(2).padStart(5)}  ${fg} on ${bg} (min ${min})`);
  }
}
process.exit(failures ? 1 : 0);
