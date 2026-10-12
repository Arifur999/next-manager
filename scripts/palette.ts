// scripts/palette.ts
// Turns one brand color into an 11-step OKLCH ramp plus a tinted neutral ramp, ready to paste into globals.css.
// Usage (PowerShell):  pnpm exec tsx scripts/palette.ts "#0F3D3E" 0.01
//   arg 1: brand color in any CSS format; arg 2: neutral tint chroma (0 = pure grey, 0.005 to 0.02 = tinted)
import { clampChroma, converter, parse, wcagContrast, type Oklch } from "culori";

const toOklch = converter("oklch");

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
// Lightness per step and chroma relative to the peak, taken from the reference ramp in 05-design-system-implementation.md
const LIGHTNESS = [0.97, 0.932, 0.882, 0.809, 0.707, 0.623, 0.546, 0.488, 0.424, 0.379, 0.282];
const CHROMA_SHAPE = [0.06, 0.13, 0.24, 0.43, 0.67, 0.87, 1, 0.99, 0.81, 0.6, 0.37];
const NEUTRAL: Array<[string, number]> = [
  ["0", 1], ["50", 0.985], ["100", 0.97], ["200", 0.922], ["300", 0.87], ["400", 0.708], ["500", 0.556],
  ["550", 0.505], ["600", 0.439], ["700", 0.371], ["800", 0.269], ["900", 0.205], ["950", 0.145],
];
const MAX_CHROMA = 0.32;

const [input, tintArg] = process.argv.slice(2);
if (!input) {
  console.error('Usage: pnpm exec tsx scripts/palette.ts "<brand color>" [neutralChroma]');
  process.exit(1);
}

const parsed = parse(input);
const brand = parsed ? toOklch(parsed) : undefined;
if (!brand) {
  console.error(`Cannot parse color: ${input}`);
  process.exit(1);
}

const hue = brand.h ?? 0;
const neutralChroma = Number(tintArg ?? "0.01");
const nearest = LIGHTNESS.reduce((best, l, i) => (Math.abs(l - brand.l) < Math.abs(LIGHTNESS[best]! - brand.l) ? i : best), 0);
const peak = Math.min(MAX_CHROMA, brand.c / CHROMA_SHAPE[nearest]!);

const fmt = (c: Oklch) => `oklch(${c.l.toFixed(3)} ${c.c.toFixed(3)} ${(c.h ?? 0).toFixed(1)})`;
const inGamut = (l: number, c: number, h: number): Oklch => clampChroma({ mode: "oklch", l, c, h }, "oklch");
const ratios = (c: Oklch) => {
  const onWhite = wcagContrast(c, "white").toFixed(2);
  const onBlack = wcagContrast(c, "black").toFixed(2);
  return `/* ${onWhite}:1 on white, ${onBlack}:1 on black */`;
};

console.log(`/* brand ${input} = ${fmt(brand)}, placed at step ${STEPS[nearest]} */`);
STEPS.forEach((step, i) => {
  // The exact brand color keeps its own step so the logo color appears verbatim
  const color = i === nearest ? inGamut(brand.l, brand.c, hue) : inGamut(LIGHTNESS[i]!, peak * CHROMA_SHAPE[i]!, hue);
  console.log(`--p-brand-${step}: ${fmt(color)}; ${ratios(color)}`);
});

console.log("");
for (const [step, l] of NEUTRAL) {
  const color = inGamut(l, step === "0" ? 0 : neutralChroma, hue);
  console.log(`--p-neutral-${step}: ${fmt(color)}; ${ratios(color)}`);
}
