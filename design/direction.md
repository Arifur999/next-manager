# Direction: Ledger ink

## 1. Adjectives

Precise, calm, accountable . never salesy. Every decision below is checked against these.

## 2. References

Web access was not used to open these while writing; each one is marked unverified and is cited for one idea only.

| # | Reference | Borrowing exactly this | Not borrowing | Checked |
|---|---|---|---|---|
| 1 | linear.app (marketing) | Product UI rebuilt in HTML as the hero visual, not a screenshot | Dark-first gradients and glow | unverified |
| 2 | Stripe docs | Hairline rules and quiet neutrals carrying dense information | Indigo brand colour | unverified |
| 3 | Mercury (banking) | Money shown calmly: tabular figures, muted labels, one accent | Large lifestyle photography | unverified |
| 4 | Harvest (time tracking) | Timesheet rows as a familiar, readable unit | Orange brand, illustration style | unverified |
| 5 | Height (project tool) | Annotated product frames placed asymmetrically | Floating 3D shapes | unverified |
| 6 | SBB timetable typography (outside the niche) | Tabular, ruled rows where every number lines up | Red and the signage typeface | unverified |
| 7 | A paper account ledger (outside the niche) | Ruled lines, a margin note in highlighter, two currency columns side by side | Skeuomorphic paper texture | from memory |

## 3. Direction

- Base: 03 section 5.3 Swiss technical.
- Why it fits: the product is a ledger. Work and money land in the same rows, and numbers carry two currencies (USD and BDT accounts exist in the domain types). A precise, tabular look is the product's own truth, not a style choice laid on top.
- Changed from the recipe (four):
  1. IBM Plex Sans instead of Hanken Grotesk: its width axis lets dense tables keep a condensed setting through `font-stretch` without a second family, and its figures are built for tables.
  2. Radius 6 px (`0.375rem`) instead of 4 px: controls read as touchable in a working app.
  3. Signature: the "ledger trace" (one job followed across modules) instead of one annotated screenshot.
  4. Ledger teal ink instead of signal blue: blue-violet was the old theme and the generic default.
- Palette (OKLCH as used; primitives in `globals.css`, ramps from `scripts/palette.ts`):

| Name | OKLCH | Role |
|---|---|---|
| Paper | `oklch(0.985 0.004 85)` | page background, light |
| Graphite | `oklch(0.24 0.015 230)` | text, light; ink band on marketing |
| Rule | `oklch(0.90 0.006 85)` | borders and ruled lines |
| Ledger teal ink | `oklch(0.42 0.08 195)` | primary actions, focus ring, links, chart series 1 |
| Marker | `oklch(0.92 0.15 100)` | annotations on product frames only; never text colour, never status |
| Status green | hue 150 ramp | success, always with an icon and a word |

- Type: IBM Plex Sans variable (wght 100 to 700, wdth 75 to 100; `next/font/local`, latin subset) for everything; IBM Plex Mono 400 and 500 for invoice numbers, codes and amounts inside product frames. Scale ratio 1.2 at 360 px rising to about 1.33 at 1440 px for marketing headings; fixed sizes in the app.
- Radius and depth: `--radius: 0.375rem`; hairline borders everywhere; one shadow (`--elevation-frame`) used only on product frames so they read as objects on paper.
- Imagery: no photography. The product interface is the imagery, built from the real tokens and components with sample data (long client names, USD invoices, a BDT account, hours by person). Marker strokes annotate two or three numbers per frame.
- Motion: marketing level 3, app level 1. The one orchestrated moment is the workflow headline reveal; the hero never animates. Details in `design/motion.md`.
- Signature element: the ledger trace. Five annotated frames (a lead card, a project with a milestone, a timesheet row, an invoice in USD, a payment settled into a BDT account through a recorded exchange) joined by one ruled hairline. It does the real job of answering "will this replace my four tools", and it is only true of this product.
- Density (app): compact for tables (`.font-condensed`), comfortable for forms.
- Dark mode: re-picked. Background L 0.17 tinted toward hue 220, cards L 0.21, primary around L 0.74 with a dark foreground, marker kept but used only on frames.

## 4. Generic check

- Tells used on purpose:
  - Hairline rules: the ledger is the concept; radius is 6 px, not zero, and the page is not broadsheet-styled.
  - Monospace on amounts and invoice numbers inside product frames only, because the app shows codes that way; never on marketing meta labels.
  - Numbered workflow steps: the workflow is a real sequence (lead, project, time, invoice, payment, margin).
- "Would I have produced this plan for any similar brief?" The first draft (Swiss technical with signal blue and one annotated screenshot) would fit any B2B SaaS. Changed because of it: the colour comes from ledger ink, the signature follows one real job across modules, and the copy names USD and BDT, four roles and approval queues, which no generic tool page would.
- Deliberately not doing: gradients, glass, blobs, icon-card rows, a logo strip (there are no customers to show), testimonials, a row of three big stats, a pill badge above the `h1`, tracked all-caps eyebrows, fade-up on every section, hover lift on cards.

## 5. Information architecture

```
/                      landing (this file)
/login /register /forgot-password /reset-password /join/[token] /agency-join/[token] /platform-join/[token]
/styleguide            noindex
/admin/dashboard/...   the app (unchanged IA)
```

Header nav: Product, Workflow, Roles, Pricing (hidden when no plans), FAQ; "Sign in" text link; primary CTA.

Landing sections in order:

| # | Section | Its one job | Objection answered | Proof used |
|---|---|---|---|---|
| 1 | Hero | Say what it is and for whom; one action | "What is this?" | Product frame of a dashboard slice |
| 2 | Ledger trace | Show one job crossing every module | Another tool to learn; we bill abroad and pay locally | Five annotated frames |
| 3 | Problem | Name the status quo and its cost | "My spreadsheet works" | The buyer's own tools named |
| 4 | Module band | Show breadth in one sentence with counts | "Does it cover X?" | Counts derived from `MODULES` |
| 5 | Features | Five capability blocks, varied layouts | "Does it do what I do today?" | Product crops |
| 6 | Workflow | The sequence and who does each step | Another tool to learn | Numbered steps with role names |
| 7 | Roles | Who sees what; security strip | My team will see the money; is client data safe | Scope grid from the route table |
| 8 | Pricing teaser | Real plans from the API | What does it cost | `GET /public/plans`; hidden when absent |
| 9 | FAQ | Remaining objections | After the trial; training; USD and BDT | Plain answers matching the code |
| 10 | Final CTA | Restate the outcome, one action | Last hesitation | Same CTA label |

Primary flow: `/` -> primary CTA -> `/register` (1 click, 4 fields) -> dashboard.

## 6. Wireframes (text)

Hero:

```
375                              1280
+----------------------+         +--------------------------------------------------------------+
| N Naxified   [menu]  |         | N Naxified  Product Workflow Roles Pricing FAQ  Sign in [CTA] |
| h1 (3 lines)         |         | h1 (7 cols, 3 lines)                 | product frame (5 cols)|
| subhead              |         | subhead                              | KPI tiles, invoice    |
| [Primary CTA]        |         | [Primary CTA]  See how a project flows| rows, marker notes   |
| micro-copy           |         | micro-copy                           |                       |
| product frame (top)  |         +--------------------------------------------------------------+
+----------------------+           next section rule peeks below the fold
```

Ledger trace:

```
375 (horizontal rail, snap)      1280 (ruled grid)
+----------------------+         +--------------------------------------------------------------+
| h2                   |         | h2 (6 cols)                       intro (5 cols)             |
| [frame 1] [frame 2 > |         | --o-----------o-----------o-----------o-----------o--------- |
| caption   caption    |         | lead      project     hours       invoice USD  paid in BDT  |
| --o------o------     |         | caption   caption     caption     caption      caption      |
+----------------------+         +--------------------------------------------------------------+
```

## 7. Principles

1. The product is the picture: every visual is real interface built from the app's tokens, never decoration.
2. Numbers line up: tabular figures, right-aligned amounts, currency always named, never added across currencies.
3. One accent, used for action: teal ink marks what you can do; marker yellow marks what to notice; everything else is graphite on paper.
