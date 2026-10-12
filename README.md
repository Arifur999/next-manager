# Naxified Management (web)

The web frontend of Naxified Management, a multi-tenant SaaS in which a service business runs its client work and its money in one workspace: leads and clients, service packages, projects with milestones, tasks on custom workflow columns, timesheets with approval, invoices and payments, expenses, payouts, withdrawals, dues, loans and shareholders, USD and BDT accounts with recorded rates, profit and loss, cash flow, KPI targets, attendance, leave, payroll, departments, a credential vault and team chat. Four workspace roles (admin, sales, project manager, operations) plus a per-person permission grid decide who sees what. A separate platform console lets the super admin sell plans to workspaces. The public landing page lives at `/`.

The API is the sibling repo `next-manager-backend` (Express, Prisma, PostgreSQL, cookie JWT).

## Prerequisites

- Node.js 22 or newer (the Docker image uses 24) and npm (one lockfile: `package-lock.json`).
- The backend running on http://localhost:5000 with its database migrated and seeded (see its README).

## Setup

PowerShell, one command per line:

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Then open http://localhost:3000 and sign in with a seeded account (local credentials are in `D:\dev\CREDENTIALS.txt`).

## Environment

| Variable | Needed | What it is |
|---|---|---|
| `API_BASE_URL` | production (dev defaults to `http://localhost:5000/api/v1`) | Server-side route to the API. `API_INTERNAL_URL` is still accepted as a deprecated alias. |
| `JWT_ACCESS_SECRET` | always | Must equal the backend's `ACCESS_TOKEN_SECRET`: `src/proxy.ts` verifies access tokens locally. |
| `SITE_URL` | production | Public origin for metadata, canonical links, the sitemap and JSON-LD. Defaults to `http://localhost:3000`. |
| `LOG_LEVEL` | optional | `debug`, `info` (default), `warn` or `error`. |
| `NEXT_PUBLIC_DEV_WS_URL` | development only | Chat socket address while `next dev` and the API run on different ports. In production the socket is `/ws` on the page origin. |

`src/env.ts` validates these at boot (`src/instrumentation.ts`): a production server missing `API_BASE_URL` or `JWT_ACCESS_SECRET` logs "Invalid server environment" naming the variable and answers every request with 500.

## Scripts

| Command | What it does | Needs |
|---|---|---|
| `npm run dev` | Dev server on port 3000 | backend on 5000 |
| `npm test` | Vitest, every `src/**/*.test.ts`, pinned to UTC | nothing |
| `npm run lint` | ESLint, including `no-console` and the query key rule | nothing |
| `npm run verify` | Production build into `.next-check`, safe while `npm run dev` runs | `.env.local` not required |
| `npm run build` / `npm start` | Production build and server | env as above |
| `npm run qa:contrast` | Checks every colour token pair in `src/app/globals.css`, light and dark | nothing |
| `npm run test:nav` | Opens every dashboard route for every role | running app and backend, seeded users in `.env` |
| `npm run test:matrix` | Compares live route access with `scripts/role-matrix.expected.txt` | same |
| `npm run test:routing`, `test:permission-grid`, `test:login-flow`, `test:journeys` | Live routing, permission grid, sign-in and journey checks | same |

Type checking is `npx tsc --noEmit`.

## Architecture

`component -> _action.ts -> "use server" service -> server-only httpClient`. The browser never sees the API address or a token; route access is one table in `src/lib/authUtils.ts`, enforced in `src/proxy.ts`. Rules, folder map and backend contracts are in [AGENTS.md](AGENTS.md).

Design records live in `design/`: `brief.md`, `direction.md`, `content.md`, `motion.md` and `qa.md`. `/styleguide` (noindex) renders every token and core component in light and dark.

## Docker

`Dockerfile` builds Next's standalone output and runs `node server.js` as the `node` user on port 3000, with a health check on `/login`. Nothing is baked in at build time: pass `API_BASE_URL`, `JWT_ACCESS_SECRET` and `SITE_URL` as runtime environment. The backend repo's `docker-compose.yml` builds and runs this image as its `web` service; at the time of writing it still passes the deprecated `API_INTERNAL_URL` (accepted) and the unused `NEXT_PUBLIC_API_BASE_URL` build argument, and does not yet pass `SITE_URL`.
