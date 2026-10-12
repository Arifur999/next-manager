# Design QA: Naxified Management

Rubric: knowledge-base/design/01-design-process-and-principles.md Part 8. Harness: the design-review templates (Playwright 1.56, Chromium, axe), run from a scratch folder outside the repo against `next start` on the `.next-check` build. The full landing and auth review is added below once those routes are rebuilt.

## Styleguide checkpoint (C51)

Run: 2026-10-12 . `/styleguide` light run (the page renders the light and dark boards side by side) at 375 / 768 / 1280 / 1536.

- Machine gates: no overflow, no console errors, one `h1`, zero serious or critical axe violations, `npm run qa:contrast` exits 0 in both themes.
- First pass found and fixed: `text-destructive` on the destructive tint failed 4.5:1 (red too light), status green and red were neon against the calm neutrals, the radix-maia `rounded-4xl` made every control a pill, and the board overflowed 77 px at 375.
- Verdict against the adjectives (precise, calm, accountable): passes. Neutrals are quiet (warm paper, graphite text), there is one accent (teal ink) used on actions and links only, the marker yellow appears only as an annotation swatch, type has clear contrast between the 600-weight headings and 400 body, and dark mode is re-picked (cool night surfaces, lighter and less chromatic teal) rather than inverted. It does not read as stock shadcn: no indigo, no pill buttons, no soft grey card shadow.
