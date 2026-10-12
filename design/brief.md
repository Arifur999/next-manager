# Brief: Naxified Management

Date: 2026-10-12 . Status: draft, derived from the code (not yet confirmed by Arif)
Source: the repo itself (in-app copy, Prisma schema comments in `next-manager-backend`, route table in `src/lib/authUtils.ts`, nav in `src/lib/navItem.ts`) and `plans/frontend-plan.md`.
Lines marked (assumed) are inferences that still need Arif's confirmation. "Naxified" is only the product name: no founder, office, client list, history or numbers about the company behind it are stated anywhere.

## Project

- Type: public marketing page for a SaaS product (`/`), the auth pages, and a design system shared with the signed-in app.
- Pages or screens in scope: `/` (landing), `/login`, `/register`, `/forgot-password`, `/reset-password`, the three invite-join pages, `/styleguide` (noindex), and the theme of every dashboard screen.
- Business goal: people who run a client-service business create a workspace on their own (`/register` is self-serve).
- Success metric (one number): completed workspace sign-ups per week (assumed; no analytics exist yet).
- Deadline: none given.

## Audience and positioning

- Business, in one plain sentence: Naxified Management is one workspace where a service business runs its client work and its money together.
- Primary audience: the owner or operator of a small client-service business (a studio, an agency, a consultancy, a dev or design shop) that bills clients for project work and pays a team. They read on a laptop at their desk; the second visit is often on a phone (assumed).
- Their trigger: month end. The invoice total, the hours logged and the money in the bank do not agree, and someone spends a weekend in a spreadsheet to find out why.
- Jobs to be done:
  1. When a lead says yes, I want the project, the hours and the invoice to follow from it, so I stop re-typing the same client four times.
  2. When I pay my team, I want payroll and payouts to land in the same ledger as client payments, so I know my real margin this month, not next month.
  3. When I hire a salesperson or a project manager, I want them to see their work and nothing else, so I can stop hiding the money.
- Alternatives: a CRM, a time tracker, an invoicing tool, a bank app and the spreadsheet that ties them together; or one person who holds it all in their head.
- Unique attributes (from the code, all real):
  1. Work and money in the same rows: leads, projects, milestones, tasks, timesheets, invoices, payments, expenses, payouts, payroll, loans and shareholders share one ledger.
  2. Two currencies on purpose: USD and BDT accounts, each payment and exchange saved with its own rate, never added across currencies (`src/lib/currency.ts`).
  3. Four workspace roles (admin, sales, project manager, operations) with a route table that fails closed, plus a per-person permission grid with four scopes (all, assigned, own, none).
  4. A credential vault that encrypts client logins and records every reveal, an activity trail nobody can edit, and a sign-in history with failed attempts.
- Value plus proof: the proof is the product itself, shown as real interface built from the app's own tokens and components. There are no customer logos, ratings, testimonials or usage numbers, so none are shown.
- Category: business management software for service businesses (practice management, agency operations).

## Actions

- Primary action: create a workspace (`/register`). The label comes from one function, `getPrimaryCta(trialDays)`: "Start your free trial" only when the public plans endpoint reports a trial longer than 0 days on the sign-up plan, otherwise "Create your workspace".
- Secondary action: "See how a project flows" (anchor to the workflow section) for the not-ready; "Sign in" for existing users.
- Primary flow: `/` -> CTA -> `/register` (one click, then the form's fields: name, email, password, company name) -> the admin dashboard.

## Objections (each answered at a named place; full map in `direction.md` section 5)

1. "Another tool to learn." Answered by: the workflow section (six steps, each with the role that does it) and the FAQ entry on training (each role sees only its own screens).
2. "My team will see the money." Answered by: the roles section ("Your sales team never sees payroll") with the scope grid, and the FAQ entry on who sees margins.
3. "We bill abroad and pay locally." Answered by: the ledger trace (a USD invoice settled into a BDT account through a recorded exchange), the money feature block, and the FAQ entry on USD and BDT.
4. "Is client data safe?" Answered by: the security strip in the roles section (encrypted vault with logged reveals, activity trail, sign-in history, httpOnly session cookies) and the FAQ entry on client logins.
5. "What happens after the trial?" Answered by: the FAQ entry on a lapsed subscription (grace period, then read-only, nothing deleted) and the pricing teaser when plans are published.

## Voice

- Adjectives: precise, calm, accountable. Never: salesy.
- Language: English only. Body text at grade 6 to 8, sentence case, no em dashes, no emoji, no words from the 03 ban list.

## Assets and proof (real only)

- Logo, brand colors, fonts: none exist beyond the name. The old periwinkle indigo theme is replaced (it was the generic default and failed contrast). A wordmark is set in type; no logo is invented.
- Photos: none. The product UI is the imagery.
- Reviews, ratings, customer counts, logos: none. None are shown.
- Prices: only what `GET /api/v1/public/plans` returns at request time. If it fails or is empty, the pricing section is not rendered.
- Counts on the page (modules, roles, currencies, scopes) are derived from data files that mirror the code, never typed as numbers in markup.

## Constraints and budgets

- Tech: existing repo `next-manager` (Next.js 16.3, React 19.2, Tailwind v4, shadcn `radix-maia`, TanStack Query and Form, zod 4, npm).
- Dark mode: yes. The app already ships it and people work in it all day; the marketing page follows the system setting.
- Motion intensity: marketing level 3 (the product UI is the proof and benefits from a guided read), app level 1. Details in `design/motion.md`.
- Performance: LCP <= 2.5 s, CLS <= 0.1, INP <= 200 ms on mobile; 0 KB of animation JS before LCP; no hero image (the LCP element is the `h1` text).
- Legal: Privacy and Terms pages do not exist yet; footer links are marked `TODO(owner)` and not rendered as live links until they exist.
- Content owner: Arif (assumed).

## Open questions for Arif

- Billing period and currency of plans are taken from the API (`billing_interval: "month"`, `currency: "USD"`); confirm that is what the page should say.
- Publisher for the `Organization` JSON-LD (`site.publisher`): left empty, so no `Organization` node is emitted until it is filled.
- Privacy and Terms pages: who writes them, and when.
