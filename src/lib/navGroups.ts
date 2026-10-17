import { activeNavHref } from "./navMatch"
import type { NavSection } from "./navItem"

/**
 * Which sidebar groups are open, kept in a cookie rather than localStorage so
 * the server reads it too and the first render is the one the browser keeps.
 */
export const NAV_GROUPS_COOKIE = "nav-open-groups"

// A year: the sidebar is somebody's furniture, not a session preference.
export const NAV_GROUPS_MAX_AGE = 60 * 60 * 24 * 365

const GROUP_ID = /^[a-z0-9-]+$/

/** "Platform team" -> "platform-team": stable, and safe in a cookie unencoded. */
export const navGroupId = (title: string): string =>
  title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-")

// The cookie is client-writable, so anything that is not a group id is dropped.
export const parseOpenGroups = (raw: string | undefined): string[] =>
  (raw ?? "").split(".").filter((id) => GROUP_ID.test(id))

export const serializeOpenGroups = (ids: string[]): string => ids.join(".")

/** The titled group holding the current page, or null (the page is in an untitled one, or none). */
export const currentGroupId = (sections: NavSection[], pathname: string): string | null => {
  const active = activeNavHref(sections.flatMap((section) => section.items), pathname)
  const holding = sections.find(
    (section) => section.title && section.items.some((item) => item.href === active),
  )
  return holding?.title ? navGroupId(holding.title) : null
}

export const withGroupOpen = (open: string[], id: string | null): string[] =>
  id === null || open.includes(id) ? open : [...open, id]

export const toggleGroup = (open: string[], id: string): string[] =>
  open.includes(id) ? open.filter((openId) => openId !== id) : [...open, id]
