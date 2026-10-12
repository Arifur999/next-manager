# Content: landing page

Copy in page order. When a section is built its copy moves into `src/data/home/*.ts`, and that file becomes the source of truth; this document records intent and the objection map. Rules: grade 6 to 8, sentence case, no em dashes, no emoji, nothing from the 03 ban list, no invented proof. Facts that need the owner are marked `TODO(owner)`.

## Global

- Product name: Naxified Management (short: Naxified).
- Primary CTA label, one function (`getPrimaryCta(trialDays)` in `src/data/site.ts`): "Start your free trial" when the public plans endpoint reports `trial_days > 0` on the sign-up plan; otherwise "Create your workspace". Target: `/register`.
- Micro-copy under every primary CTA: "{n}-day free trial. No card needed to sign up." only when a trial is reported (the register form asks for no payment details); otherwise "Set up your workspace in a few minutes."
- Secondary: "See how a project flows" (to `#workflow`). Existing users: "Sign in".

## 1. Hero

- h1: Every client, hour and invoice in one ledger.
- Subhead: Naxified Management runs the work and the money of a service business together. Leads become projects, logged hours become invoices, and each role sees only what it should.
- Proof: a product frame of a workspace dashboard (sample data): unpaid invoices in USD, a BDT account balance, hours awaiting approval, an invoice list with a long client name. Two marker notes: "USD billed, BDT banked, never added together" and "Approved hours, ready to invoice".

## 2. Ledger trace (signature)

- h2: One job, traced from the first call to the bank.
- Intro: Most tools hold one part of a project. Here a single job moves through every module, and each step leaves a row the next step reads.
- Frames and captions:
  1. Lead: "Won. A dental practice asks for a site rebuild; sales moves the lead to Won and it becomes a client."
  2. Project: "Opened with three milestones. The first is submitted, and the client accepts it."
  3. Hours: "Logged against the milestone. A project manager approves 12.5 hours."
  4. Invoice: "Billed in USD. Approved hours and the accepted milestone go on one invoice."
  5. Payment: "Paid in USD, banked in BDT. The exchange is saved with its rate, so both figures stay true."

## 3. Problem

- h2: The spreadsheet that ties your tools together is always a week behind.
- Status quo, in the buyer's words: "Leads live in a CRM. Hours live in a time tracker. Invoices go out from a billing app. The money arrives in a bank account. Then someone copies all of it into a spreadsheet to see if the month made money."
- Named costs:
  - Hours re-typed: every logged hour is typed again to build an invoice.
  - Margins known a month late: profit per project shows up after the money is spent.
  - Payroll by hand: salaries, payouts and owner withdrawals are worked out outside the books.
  - Two currencies, one guess: dollars billed and taka paid get mixed at whatever rate was handy.

## 4. Module band

- Sentence with inline counts derived from data: "{MODULES.length} modules, {roles} workspace roles, {currencies} currencies and {scopes} permission scopes, in one workspace."
- Module list (single source `src/data/home/modules.ts`): clients, leads, services, projects, milestones, tasks, time, invoices, payments, expenses, ledger and exchange, payroll, attendance and leave, loans and shareholders, vault, chat, KPIs and reports.

## 5. Features by module

Each block: benefit (h3), what it does, a product crop.

1. Pipeline to client. "Know which leads are worth chasing." Lead stages and sources, conversion to a client in one step, and service packages you sell again and again.
2. Delivery. "See every project's next milestone." Projects with milestones that are submitted and accepted, task boards with your own workflow columns, and a workload view of who has room.
3. Time. "Bill the hours your team really worked." Timesheets, an approval queue for managers, and weekly capacity per person.
4. Money. "Know this month's margin this month." Invoices and payments, expenses, team payouts, owner withdrawals, dues, loans and shareholders, USD and BDT accounts with recorded rates, and profit and loss with cash flow.
5. People. "Run the team from the same place." Attendance, leave with balances and a calendar, payroll runs that post payouts to the ledger, departments, and team chat.

## 6. Workflow

- h2: From signed lead to paid invoice.
- Steps (a real sequence, so numbered), each with its role:
  1. Win the lead (Sales). Move it to Won; the client is created from it.
  2. Open the project (Admin or Project manager). Add milestones and the people on it.
  3. Log and approve time (Team, then Project manager). Hours wait in the approval queue until someone signs them off.
  4. Invoice the client (Admin). Approved hours and accepted milestones become invoice lines.
  5. Record the payment (Admin or Operations). Money lands in the right account, in its own currency.
  6. See the margin (Admin). Project profit and cash flow update from the rows above.

## 7. Roles, permissions and audit

- h2: Your sales team never sees payroll.
- Intro: Four workspace roles decide which screens open. A per-person grid then decides how much of each list they see.
- Role columns (from `AREAS` in `src/lib/authUtils.ts`): Admin (everything, including accounts, payroll and settings); Sales (leads, clients, invoices, services, the sales dashboard, sales and client reports); Project manager (projects, tasks, workflow, delivery, time approvals, workload, project, task and team reports); Operations (projects and tasks they work on, clients, timesheet, attendance, leave and chat). Scopes then narrow each list.
- Scope grid: all, assigned, own, none, with one per-person override example.
- Security strip (true statements only): client passwords in the vault are encrypted before they are saved, and every reveal is logged; an activity trail records who did what and cannot be edited; sign-in history shows failed attempts; sessions live in httpOnly cookies the browser's scripts cannot read.

## 8. Pricing teaser

- h2: Plans
- From `GET /api/v1/public/plans` only: name, price per month in USD, seat and project limits ("Unlimited" when null), features. Recommended plan: the one that starts on sign-up (the plan with a non-null `trial_days`), with the reason "This is the plan a new workspace starts on." If the request fails or returns no plans, the section is not rendered and the header hides its Pricing link.

## 9. FAQ

1. Who can see money and margins? Accounts, transactions, payroll, payouts and the business and finance reports open for admins only; the route table refuses everyone else before the page loads. Sales can open invoices, and project managers see project margins, because those are part of their jobs.
2. We bill clients in USD and pay our team in BDT. Does that work? Yes. Keep USD and BDT accounts side by side. When money moves between them, record the exchange with its rate. Totals are never added across currencies.
3. How do logged hours turn into invoices? People log time against a project. A project manager approves it. Approved hours can then go onto the client's invoice.
4. How are client logins protected? Client passwords in the vault are encrypted before they are saved. Revealing one is a deliberate action, and every reveal is logged with who and when.
5. What happens if a trial or subscription lapses? There is a grace period first. After that everyone can still sign in and read every record; only new changes pause until it is renewed. Nothing is deleted.
6. Will my team need training? Each role sees only the screens it works in, so a salesperson starts with leads and clients and nothing else.

## 10. Final CTA

- h2: Open your workspace and bring in your first client today.
- Body: Set up the workspace, invite your team, and record your first lead. The ledger fills in as the work moves.
- CTA: the primary label; micro-copy as in Global; "Already have a workspace? Sign in".

## Objection map

| Objection (brief) | Answered at |
|---|---|
| Another tool to learn | Workflow (6), FAQ 6 |
| My team will see the money | Roles (7), FAQ 1 |
| We bill abroad and pay locally | Ledger trace frame 5 (2), Features block 4 (5), FAQ 2 |
| Is client data safe | Roles security strip (7), FAQ 4 |
| What happens after the trial | FAQ 5, Pricing (8) when plans exist |

## TODO(owner)

- Privacy and Terms pages (footer shows them as plain text until they exist).
- `site.publisher` for the Organization JSON-LD.
- Confirm that plan prices are monthly USD, as the API states.
