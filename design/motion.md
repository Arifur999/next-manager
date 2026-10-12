# Motion direction: Naxified Management

Decided: 2026-10-12 by the executor, from `frontend-plan.md` C52. Source: knowledge-base/animation/03-motion-strategy.md

## Classification

- Site type: SaaS marketing (03 section 3.3) for `/`; Dashboard / admin app (3.13) for every signed-in route, level 1.
- Audience and devices: owners and operators of service businesses, mostly on laptops during work hours; a share on phones (assumed).
- Brand tone: precise, calm.
- Intensity level: marketing 3, because the product UI is the proof and a guided read through it helps (the ledger trace, the workflow). App 1: people are working, not browsing. Auth pages 1.

## Budget (03 section 1.3)

| Line | Value |
|---|---|
| Hero moments per page | 0. The hero is static: its `h1` is the LCP element |
| Animation JS before LCP (gzip) | 0 KB. GSAP is not in the initial bundle; `loadGsap()` imports it when an animated section comes within a quarter screen of the viewport or on the first scroll, key or touch |
| Animation JS after LCP (gzip) | about 51 KB: GSAP core 28 + ScrollTrigger 18 + SplitText 3.7 + CustomEase, fetched on demand (nothing for a visitor who reads only the first screen) |
| Max concurrent animating elements | 6 |
| Max entrance before content is usable | 0 ms on the hero; reveals below the fold finish within 600 ms |
| Continuous loops above the fold | 0. The module marquee sits below the fold, with a pause button |
| Smooth scroll | No |
| LCP element | Hero `h1`; never animated from opacity 0 |

## Tokens

Durations (ms): instant 100, fast 150, base 220, slow 320, page 400, reveal 600, stagger 50
Easings: out-quart cubic-bezier(0.25, 1, 0.5, 1), out-expo cubic-bezier(0.16, 1, 0.3, 1), in-quart cubic-bezier(0.5, 0, 0.75, 0), in-out-cubic cubic-bezier(0.65, 0, 0.35, 1)
Bounce allowed: no (money product)
Live in: `src/app/globals.css` (`@theme` easings, `:root` durations) and `src/lib/motion.ts` (`DURATION`, `EASE`, `MQ`)

## Patterns

| # | Where | Pattern | Job | Tool | Trigger | Reduced motion | Lite tier |
|---|---|---|---|---|---|---|---|
| 1 | All buttons and links | Colour change, 1 px press | Feedback | CSS transition (fast) | hover / press | Colour change only | Same |
| 2 | Dialogs, menus, sheets (app and marketing) | Fade and 0.96 scale | Continuity | tw-animate-css on Radix `data-state` | open / close | Fade only (CSS floor) | Same |
| 3 | Ledger trace frames | One-time reveal, 16 px rise, 50 ms stagger | Orientation: read the trace left to right | GSAP ScrollTrigger (`FadeIn`) | in view, once | Final state | n/a |
| 4 | Feature blocks' product crops | One-time reveal, 16 px rise | Attention to the crop next to its claim | GSAP (`FadeIn`) | in view, once | Final state | n/a |
| 5 | Roles scope grid | One-time reveal of the grid as one group | Orientation | GSAP (`FadeIn`) | in view, once | Final state | n/a |
| 6 | Workflow `h2` | Masked word reveal, 0.05 s stagger, under 400 ms | Personality, once per page (the one level 4 pattern, by plan) | GSAP SplitText (`SplitReveal`) | in view, once | Whole heading, no split | n/a |
| 7 | Module band counts | Count up once | Attention to breadth | GSAP (`Counter`), final value in SSR HTML and `sr-only` | in view, once | Final value | n/a |
| 8 | Module list | Two-group marquee, slow, pauses on hover, focus and offscreen, visible pause button | Personality | GSAP (`Marquee`) | in view | Static wrapped list | n/a |

Not doing, and why: no fade-up on every section (the problem section, pricing, FAQ and closing band appear as they are; 03 section 3.3 names blanket fade-ups as the most common AI-site smell); no hero sequence (it would delay the CTA and the LCP); no parallax, cursor effects, smooth scroll or page transitions; no motion on table rows or dashboard lists (frequency rule).

## Libraries

| Library | Version | Why (which patterns) | Loaded |
|---|---|---|---|
| gsap | 3.15.0 | #3 to #8 (ScrollTrigger, SplitText) | Dynamic import from `src/lib/gsap.ts`, started by `useLazyGsap` near the section or on first interaction |
| (removed) @gsap/react | - | replaced by `useLazyGsap` (`src/components/motion/useLazyGsap.ts`), which owns cleanup | - |

Rules: one library owns an element; ScrollTrigger is the only scroll-trigger system on the page; registration happens only in `src/lib/gsap.ts`.

## Accessibility plan

- `prefers-reduced-motion`: every row has a reduced column; the CSS safety net is in `globals.css`.
- `[data-reveal]` starts at opacity 0 only under `(scripting: enabled) and (prefers-reduced-motion: no-preference)`, so the page is complete with JavaScript off and with reduced motion. Opacity, not visibility: content stays focusable and in the accessibility tree before GSAP arrives, focus inside shows it at once, and a failed import shows it without animation.
- Reveals animate `opacity` (not `autoAlpha`) where links sit inside, and jump to the end on `focusin`.
- The marquee has a visible pause button, pauses on hover, focus and offscreen; its duplicate group is `aria-hidden` and `inert`.
- No pointer-only effects.

## Performance plan

- Device tiers: not needed at level 3.
- Lazy: GSAP is never in the initial bundle. Components under `src/components/motion/` call `useLazyGsap`, which imports and registers it once (`loadGsap()` in `src/lib/gsap.ts`) and reverts through a matchMedia scoped to the element. `@gsap/react` is no longer used.
- Landing sections below the hero use `content-visibility: auto` (`render-when-near`), so reveals set up only once their section is rendered; `ScrollTriggerAutoRefresh` refreshes when section heights settle, and never loads GSAP itself.
- Test: reduced-motion emulation (the design-review harness always emulates it), JS-off render, Slow 4G reload for a flash of hidden content.

## Hand-off

- Implement with: `gsap-animation` (rows 3 to 5, 7, 8) and `text-animation` (row 6).
- Review with: 03 section 8 pre-ship checklist.
