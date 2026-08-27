# Naxified Management — Frontend

Next.js 16 (App Router) + TypeScript + shadcn/ui + TanStack Query/Form/Table,
built on the `component → _action → service → httpClient` pattern.

## Setup

```bash
npm install
cp .env.example .env.local     # then set the API URL and JWT secret
npm run dev                    # http://localhost:3000
```

`JWT_ACCESS_SECRET` must match the backend's `ACCESS_TOKEN_SECRET` exactly —
`src/proxy.ts` verifies the access token locally before letting a route render.
Run the backend (`naxified_backend`) on port 5000 first.

## Layout

```
src/
  app/
    layout.tsx                      fonts, providers, Toaster
    providers/                      QueryProvider, ThemeProvider
    (commonLayout)/                 public site
      page.tsx
      (auth)/login/{page.tsx,_action.ts}
    (dashboardLayout)/              sidebar + navbar shell, force-dynamic
      admin/dashboard/              owner / manager area
        team-management/{page.tsx,_action.ts,loading.tsx}
      dashboard/                    staff area
  components/
    ui/                             shadcn primitives (generated)
    shared/                         DataTable, AppField, AppSubmitButton, cells
    modules/<Domain>/<Feature>/     feature components
  hooks/                            useRowActionModalState
  lib/                              httpClient, authUtils, navItem, iconMapper
  services/<feature>.services.ts    "use server", thin httpClient calls
  types/  zod/                      one file per domain, kept in sync
  proxy.ts                          route protection (Next 16 renamed middleware)
```

## Adding a feature

1. `src/types/<f>.types.ts` — `I<Name>` matching the API response
2. `src/zod/<f>.validation.ts` — create + edit schemas, inferred value types
3. `src/services/<f>.services.ts` — `"use server"`, thin `httpClient` calls
4. `app/.../<f>-management/_action.ts` — wraps each service, normalizes errors
5. `components/modules/<Domain>/<Feature>/<f>Columns.tsx`
6. `…/<Feature>Table.tsx` — `useQuery` + `useRowActionModalState` + `DataTable`
7. `Create…FormModal`, `Edit…FormModal`, `Delete…ConfirmationDialog`
8. `page.tsx` (prefetch + `HydrationBoundary`) and `loading.tsx`

Rules that are not optional: a component never imports `httpClient`; every
action returns `ApiResponse<T> | ApiErrorResponse` and never throws; the
`page.tsx` prefetch and the table's `useQuery` share one query key; after a
successful mutation always `toast` → close → `reset` → `invalidateQueries` →
`router.refresh()`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | dev server |
| `npm run build` | production build |
| `npm run start` | serve the production build |
| `npm run lint` | eslint (Next 16 removed `next lint`) |

## Route protection

`src/lib/authUtils.ts` declares route ownership as data; `src/proxy.ts` resolves
it in a fixed order — proactive token refresh, signed-in users off the auth
pages, public routes through, anonymous users to `/login?redirect=…`, then the
role check. Adding a protected area means adding a pattern to `authUtils`, not
writing a new check.
