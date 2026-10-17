/**
 * Which link is the page you are on: one answer for the sidebar, one for the
 * view tabs on a page. Pure, so both can be tested without a browser.
 */

export const pathOf = (href: string): string => href.split("?")[0]

const queryOf = (href: string) => new URLSearchParams(href.split("?")[1] ?? "")

// "/clients" holds "/clients" and "/clients/42", never "/clients-archive".
const isWithin = (pathname: string, path: string) =>
  pathname === path || pathname.startsWith(`${path}/`)

export type NavTarget = {
  href: string
  /** Lit on this path only: a role's home is a prefix of every page under it. */
  exact?: boolean
  /** Lit anywhere under this path when it is wider than href's own. */
  activePath?: string
}

const activePathOf = (target: NavTarget) => target.activePath ?? pathOf(target.href)

const holds = (target: NavTarget, pathname: string) =>
  target.exact ? pathname === activePathOf(target) : isWithin(pathname, activePathOf(target))

/**
 * The sidebar entry for the current page, or null when none holds it.
 *
 * Decided by path alone: there is one entry per destination, and the views of
 * a page are tabs on it rather than entries. When two entries hold the page
 * (/reports holds /reports/clients) the deeper path wins, so exactly one lights.
 */
export const activeNavHref = (targets: NavTarget[], pathname: string): string | null => {
  const holding = targets.filter((target) => holds(target, pathname))
  const deepestFirst = holding.sort((a, b) => activePathOf(b).length - activePathOf(a).length)
  return deepestFirst[0]?.href ?? null
}

/**
 * The view tab for the current URL, or null when the URL is a view no tab
 * offers.
 *
 * The tabs of one page own every query key any of them sets. A tab is active
 * when the URL gives each owned key exactly the tab's value (or none, where
 * the tab sets none), so paging and search never unlight a tab and a sibling's
 * filter always does. Tabs on different paths (Services, Categories) compare
 * by path alone.
 */
export const activeViewHref = (
  hrefs: string[],
  pathname: string,
  params: Pick<URLSearchParams, "get">,
): string | null => {
  const onThisPage = hrefs.filter((href) => pathOf(href) === pathname)
  const ownedKeys = [...new Set(onThisPage.flatMap((href) => [...queryOf(href).keys()]))]

  const active = onThisPage.find((href) => {
    const wanted = queryOf(href)
    return ownedKeys.every((key) => params.get(key) === wanted.get(key))
  })
  return active ?? null
}
