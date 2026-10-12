# Design QA: Naxified Management

Rubric: knowledge-base/design/01-design-process-and-principles.md Part 8. Harness: the design-review templates (Playwright 1.56, Chromium, axe), run from a scratch folder outside the repo against `next start` on the `.next-check` build. The full landing and auth review is added below once those routes are rebuilt.

## Styleguide checkpoint (C51)

Run: 2026-10-12 . `/styleguide` light run (the page renders the light and dark boards side by side) at 375 / 768 / 1280 / 1536.

- Machine gates: no overflow, no console errors, one `h1`, zero serious or critical axe violations, `npm run qa:contrast` exits 0 in both themes.
- First pass found and fixed: `text-destructive` on the destructive tint failed 4.5:1 (red too light), status green and red were neon against the calm neutrals, the radix-maia `rounded-4xl` made every control a pill, and the board overflowed 77 px at 375.
- Verdict against the adjectives (precise, calm, accountable): passes. Neutrals are quiet (warm paper, graphite text), there is one accent (teal ink) used on actions and links only, the marker yellow appears only as an annotation swatch, type has clear contrast between the 600-weight headings and 400 body, and dark mode is re-picked (cool night surfaces, lighter and less chromatic teal) rather than inverted. It does not read as stock shadcn: no indigo, no pill buttons, no soft grey card shadow.

## Landing and auth review (after C75)

Run: 2026-10-12 . iteration 2 . build `33d5caa` (screenshots from the build just before it; that commit only removed the italic font preload)
Routes: `/` (home), `/login`, `/register`, `/forgot-password`, `/reset-password?token=qa-sample`, a 404 route . widths 375 / 768 / 1280 / 1536 . schemes light, dark . reduced motion emulated
Harness: design-review templates (visual-qa and focus-probe specs) in `/home/claude/scratch-frontend/nmqa`, against `next start` on the `.next-check` build with the local API up. Lighthouse 12, mobile preset, run from the same folder. Screenshots are not committed.

Note on data: the local database holds 134 active plans left by backend E2E runs (all priced 0), so the pricing section showed four of them as "Free". That is the real API output in this environment, not page copy.

### 1. Machine gates

| Gate | Source | Result | Note |
|---|---|---|---|
| No horizontal overflow at any width | results `overflowPx` | pass | all 6 routes, both schemes, 4 widths |
| No console errors | `consoleErrors` | pass, one accepted | 0 on every route except the 404 route, whose 4 entries are the document's own 404 status (one per width), which is the correct response |
| No broken images | `brokenImages` | pass | the page uses no raster images |
| Exactly one h1 per route | `h1Count` | pass | every route, every width |
| Zero serious/critical axe violations | `axeViolations` | pass (iteration 2) | iteration 1 found 4, fixed below |
| Focus never obscured; skip link first | `*--focus.json` | pass | first stop is "Skip to main content" on all 6 routes; 0 obscured |
| Token contrast (light and dark) | `npm run qa:contrast` | pass | exit 0, every pair including band and marker |
| Lighthouse a11y >= 0.95 | lighthouse mobile | pass | 1.00 on `/` and `/login` |
| Lighthouse CLS <= 0.1 | lighthouse mobile | pass | 0 on both |
| Lighthouse LCP <= 2.5 s, perf >= 0.9 (mobile, marketing) | lighthouse mobile | FAIL on `/` | `/`: LCP 2.9 to 3.6 s, perf 0.79 to 0.81, TBT 360 to 610 ms across two runs. `/login`: LCP 1.4 to 2.8 s, perf 0.94 to 0.99 |
| typecheck, lint, test, build | repo scripts | pass | 177 tests |

### 2. Rubric

| # | Item | Score | Evidence | Note / fix |
|---|---|---|---|---|
| 1 | Clarity in 5 seconds | 5 | `home--light--1280--fold`, `--375--fold` | h1 says what, subhead says for whom, one CTA, product frame beside it |
| 2 | Real content | 5 | screenshots, `src/data/home/*` grep | no lorem, no fake proof; sample data is labelled "Sample data" in every frame |
| 3 | Single primary action, verb + outcome | 5 | header, hero, closing band | one label from `getPrimaryCta`, asserted by `content.test.ts` |
| 4 | Trust near the decision point | 3 | hero fold | no customer proof exists, so trust rests on the product frame and the security strip lower down; nothing more can honestly be added |
| 5 | Squint test | 5 | `home--squint--1280` | headline and the teal CTA dominate |
| 6 | Grayscale test | 4 | `home--gray--375`, `--1280` | hierarchy holds; the marker notes lose their pop in gray but stay numbered |
| 7 | Type discipline | 5 | styleguide, home parts | one family (Plex Sans) plus Plex Mono for codes, weights 400/500/600, fluid scale |
| 8 | Measure and line height | 5 | home parts | body capped at 52 to 62ch |
| 9 | Spacing rhythm | 4 | `home--light--1280--part0x` | consistent section padding; the problem section's left column ends well above its list at 1280 |
| 10 | Alignment | 5 | 1280 and 1536 parts | 12-column grid, shared left edge |
| 11 | Grouping, few boxes | 4 | roles and pricing grids | ruled lists instead of cards; the pricing grid is a boxed table by necessity |
| 12 | Colour budget | 5 | screenshots | teal on actions and links only, marker on annotations only |
| 13 | Token compliance | 5 | grep: no hex or arbitrary colours in `src` outside `globals.css` | OG image uses rgb values mirrored from tokens, documented |
| 14 | Consistency | 5 | frames across hero, trace, crops | one `FrameChrome`, one status chip style with icon and word |
| 15 | Imagery and icons | 4 | screenshots | no photography by design; lucide icons only inside frames and status chips |
| 16 | Dark mode designed | 5 | `home--dark--1280--*`, `register--dark--1280--fold` | night surfaces tinted 220, lighter teal, ink band turns deep teal instead of flashing to paper |
| 17 | States complete | 4 | FAQ, auth forms, styleguide | hover, focus, disabled, error, session-expired alert, first-error focus; loading only on auth submit |
| 18 | Motion | 4 | `motion.md`, Chromium checks | reveals only on three places, 600 ms reveal, no motion on the hero; marquee pausable |
| 19 | Forms | 5 | register and login screenshots, autocomplete check | labels above, types, autocomplete, inline errors that say how to fix, focus to first error |
| 20 | (A) Contrast | 5 | `qa:contrast`, axe | after fixing `link-in-text-block` |
| 21 | (A) Keyboard and focus | 5 | focus JSON and crops | visible teal rings, skip link first, nothing obscured, rail and crop scrollers focusable |
| 22 | (A) Semantics | 5 | axe, h1 counts | one h1, landmarks, ordered lists for sequences, labelled regions |
| 23 | (A) Targets | 4 | axe `target-size` fixed | password eye button raised to 28 px; text links in sentences rely on line height |
| 24 | (A) Reduced motion | 5 | harness emulates reduce; Chromium check | everything visible, no split, marquee static and wrapped |
| 25 | Responsive | 5 | 375 / 768 / 1536 parts | no sideways scroll; 1536 is contained, not stretched |
| 26 | Performance | 3 | Lighthouse | CLS 0 and fonts self-hosted, but mobile LCP on `/` is over 2.5 s and TBT is high (framework plus GSAP chunks under 4x CPU) |
| 27 | Edge cases | 4 | long client names truncate with title, empty pricing hides itself, API-down run | dashboard states built but not screenshotted (need a session) |

Average: 4.56 . Lowest: #4 = 3, #26 = 3 . (A) items 20 to 24 all >= 4: yes

### 3. Generic-AI check

Tells present, each with its reason in `direction.md`:
- Hairline rules throughout: the ledger concept; radius is 6 px, not zero.
- Monospace on invoice numbers and amounts inside frames only.
- Numbered steps in the trace and workflow: both are real sequences.

Not present: gradients, glass, blobs, icon-card rows, logo strip, testimonials, three big stats, pill badge, tracked all-caps eyebrows on the landing page, fade-up on every section, hover lift.

Logo-swap test at 375 and 1280: no. The trace follows one job from lead to a USD invoice banked in BDT through a recorded rate, the roles grid is the product's own scope table, and the copy names USD and BDT, four roles and an approval queue; a competitor's logo on this page would make claims that product does not make.

Signature element present and doing real work: yes, the ledger trace answers "will this replace my tools" with one traced job.

### 4. Verdict

FAIL on one machine gate: Lighthouse mobile performance on `/` (perf 0.79 to 0.81, LCP 2.9 to 3.6 s). Every other gate and the rubric rules pass. Auth pages pass all gates.

### 5. Fix list

| # | Route / scheme / width | Problem | Fix | Status |
|---|---|---|---|---|
| 1 | home 375 | `scrollable-region-focusable` on crop scrollers | regions focusable and labelled | fixed |
| 2 | login | `target-size` on the password eye button | 28 px hit area | fixed |
| 3 | register, forgot-password | `link-in-text-block` | inline links underlined, `primary-strong` | fixed |
| 4 | home 375 | invoice number broke at the hyphen | `whitespace-nowrap` | fixed |
| 5 | home all | italic font preloaded but unused | upright face only | fixed (LCP 4.0 to 2.9-3.6 s) |
| 6 | home mobile | LCP over 2.5 s, TBT 360 to 610 ms | candidates: load the GSAP islands after idle or on view, trim the shared client chunk (Toaster, QueryProvider on a static marketing page) | open, needs a decision on loading the marketing page without the app providers |
| 7 | home | pricing shows E2E plans locally | none in code; clean the local plans table | environment |

### 6. Iteration log

- Iteration 1: 4 serious axe findings (scroll regions, target size, two inline link blocks), 404 console entries judged correct. Fixed #1 to #4.
- Iteration 2: all axe, overflow, h1 and focus gates pass; Lighthouse measured; italic preload removed (#5); performance gate still open (#6).
