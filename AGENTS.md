# Naxified Management (web)

Next.js frontend of a multi-tenant SaaS where a service business runs its client work and its money in one workspace, plus a platform console for the super admin and a public landing page. Sibling repo: `next-manager-backend` (Express, Prisma, cookie JWT).

## Commands

PowerShell, one per line.

```powershell
npm install
npm run dev                                  # http://localhost:3000; the API is expected on http://localhost:5000
npm test                                     # vitest, every src/**/*.test.ts, TZ=UTC
npx vitest run src/lib/authUtils.test.ts     # one file
npx tsc --noEmit
npm run lint
npm run verify                               # next build into .next-check (NEXT_DIST_DIR), never clobbers a running dev server
npm run qa:contrast                          # token contrast pairs, light and dark
```

Before saying done: `npx tsc --noEmit`, `npm run lint`, `npm test`, and `npm run verify` for anything touching the proxy, layouts, env or fonts.

Live checks that need the backend and seeded users: `npm run test:nav`, `test:matrix`, `test:routing`, `test:permission-grid`, `test:login-flow`, `test:journeys` (`scripts/*.mjs`, read `.env`).

Env: copy `.env.example` to `.env.local`. Variables: `API_BASE_URL`, `JWT_ACCESS_SECRET`, `SITE_URL`, `LOG_LEVEL`, dev-only `NEXT_PUBLIC_DEV_WS_URL`. Local credentials live in `D:\dev\CREDENTIALS.txt`; never paste them anywhere.

## Stack

Next.js 16.3 (App Router, `src/proxy.ts` instead of middleware), React 19.2, TypeScript strict, Tailwind v4 with shadcn `radix-maia`, TanStack Query, Form and Table, zod 4, vitest, GSAP 3.15 on the marketing page only. Next 16 and Tailwind 4 are newer than most training data: read `node_modules/next/dist/docs/` before using an API from memory.

## Architecture

- Layering: `component -> _action.ts -> "use server" service -> server-only httpClient`. The browser never sees the API base URL or a token.
- `src/services/<domain>.services.ts` and `src/types/<domain>.types.ts`: one file per domain (crm, project, work, billing, finance, spending, people, catalog, workspace, insights, platform).
- `src/queries/<domain>.queries.ts`: one `queryOptions` (or `infiniteQueryOptions`) per read; keys from `src/lib/queryKeys.ts`.
- `src/lib`: `authUtils.ts` (route table), `logger.ts`, `apiFailure.ts`, `queryString.ts`, `currency.ts`, `dates.ts`, `runAction.ts`, `paging.ts`. `src/env.ts` is the only reader of server env.
- Tables: one `DataTable` (`src/components/shared/table`) on TanStack Table. In memory by default (sort, column filters, search, paging, CSV export, column visibility remembered per `tableId`); lists that grow are server-paged with `useServerDataTable(CONFIG)`, which keeps page, size, search and filters in the URL. The CONFIG lives at module scope beside the table and the page prefetches with `buildTableQueryString(searchParams, CONFIG)`, so both build the same query key. Pure helpers in `src/lib/table` (`csv`, `filterFns`, `filterOptions`, `pageWindow`, `urlState`, `queryProps`), all tested.
- Shared UI: `PageHeader` for every page heading, `ConfirmDialog` for anything destructive or that moves money, `PanelState` / `ErrorState` for non-table lists, `AppField` for every text, number and date input (label, error, `description`, limits), `RelativeTime` for "3 minutes ago", `InviteLinkPanel` for a link shown once after an invite.
- Landing page: `src/app/(commonLayout)/(marketing)`, sections in `src/components/modules/Home/<Section>/`, copy in `src/data/home/*.ts`, site facts in `src/data/site.ts`. Design records in `design/` (brief, direction, content, motion, qa).
- Tokens: `src/app/globals.css` (primitives, then semantic light and dark, then `@theme inline`).

## Invariants

- Never log raw axios errors, headers or cookies; use `logApiFailure` or `logger`. Why: the axios error carries the session cookies (finding F1). `no-console` is a lint error outside `logger.ts` and `scripts/`.
- `server-only` on modules that touch tokens or server env (`env.ts`, `lib/axios/httpClient.ts`, `services/auth.services.ts`). `refreshSession.ts`, `cookiesUtils.ts` and `authCookies.ts` must never be `"use server"`. Why: that directive turns every export into a public endpoint; `getCookie` once returned the httpOnly token to any caller.
- The route table in `src/lib/authUtils.ts` (`AREAS`, first match wins) is the only access rule, and it fails closed. Its order is the permission. Guarded by `src/lib/authUtils.matrix.test.ts` and `scripts/role-matrix.expected.txt`.
- Token refresh happens in `src/proxy.ts` only. An API outage is an error, not a sign-out (`getUserInfo` returns null only for 401 and 403).
- Redirects after sign-in go through `safeRedirect`. Why: `?redirect=//evil.example` used to leave the site.
- Query keys come only from `queryKeys` through `src/queries`; an inline `queryKey: [` is a lint error.
- USD and BDT are never added together; format money with `lib/currency.ts` (negative amounts get a typographic minus so the sign never wraps away from the figure).
- Calendar days from the API (`"2026-09-01"`) are parsed with `toDate` from `lib/dates.ts`, never `new Date()`, which reads them as midnight UTC and shows the previous day west of Greenwich. Today's day for a form default is `todayIsoDate()`, never `toISOString()`, which is still yesterday in Dhaka until 6am.
- Relative times render through `RelativeTime`, never `formatDistanceToNow` during render: the server and the browser read the clock moments apart, and across a boundary React discards the server HTML.
- Colours, radius, type and motion come from tokens in `globals.css`; no hex in `src` outside it (the OG image uses rgb values mirrored from tokens). Every new colour pair gets a line in `scripts/check-contrast.ts`.
- The landing page shows only real proof: no logos, ratings, testimonials or invented numbers. Prices come only from `GET /api/v1/public/plans`; when it fails, the pricing section, its nav link and any trial promise disappear.
- One primary CTA label everywhere, from `getPrimaryCta(trialDays)`. Guarded by `src/data/home/content.test.ts`.

## Contracts with the backend

- Envelope `{ success, message, data, meta }`; errors `{ success: false, message, errorSource, requestId }` plus an `x-request-id` header. The page count is `meta.totalPages`.
- `limit` is capped at 200: lists that grow use `page` + `limit` (`lib/paging.ts`; the activity feeds ask for 50).
- `GET /api/v1/public/plans` (unauthenticated, cached 300 s) is parsed by `src/zod/publicPlans.validation.ts`.
- The compose `web` service passes `API_BASE_URL` (or the deprecated `API_INTERNAL_URL`) and `SITE_URL` at runtime; the chat socket is `/ws` on the page origin.

## Do

- Server Components by default; `"use client"` only on the leaf that needs it.
- Forms: TanStack Form with a form zod schema and a server zod schema; pass `autoComplete`.
- New dashboard lists get a skeleton, an error with Retry (`ErrorState`, `PanelState`) and a first-use empty state. Tables get all three from `DataTable` with `{...toTableQueryProps(query)}`.
- Writes go through `useActionMutation` (toast, invalidate, refresh, stable `run`); `successMessage: false` where the screen already shows the result.
- Check UI changes in the browser against the local API. The TanStack Query devtools (development only) can force any query into its error or loading state.
- Commit as Conventional Commits with a behaviour-focused subject.

## Don't

- Don't edit generated `src/components/ui/*` to restyle; change tokens instead.
- Don't add GSAP to app screens (motion level 1 there) or animate the landing `h1`.
- Don't read `process.env` outside `env.ts`, `csp.ts`, `cookiesUtils.ts`, `logger.ts` and the dev-only socket URL in `hooks/useChatSocket.ts`.
- Don't push without running the checks above. CI (`.github/workflows/ci.yml`) repeats lint with `--max-warnings 0`, typecheck, tests and the build on pull requests and on `main`, and builds the Docker image for pull requests.

## Known gaps

- Three plain `useMutation` calls stay on purpose: the permission grid (a refused change refetches too), the vault access log (read fresh on every open) and forgot-password (must never toast).
- Logout clears the cookies but does not revoke the refresh token on the backend.
- `test:nav` and `test:routing` cover the platform owner only with the backend `.env` loaded; `scripts/role-routing.mjs` says how.
- Invite flows send real email through the configured SMTP, so they are not clicked through against a local API that has one.

## Deploy

`Dockerfile` builds the standalone output; runtime env comes from compose (`API_BASE_URL`, `SITE_URL`, `JWT_ACCESS_SECRET`). Nothing deploys on push.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
