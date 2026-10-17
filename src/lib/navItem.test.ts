import { describe, expect, it } from "vitest"
import { ALL_ROLES, canRoleReach, type UserRole } from "./authUtils"
import { ACCOUNT_LINKS, describeBadge, getNavSections } from "./navItem"
import { activeNavHref, activeViewHref, pathOf } from "./navMatch"
import {
  CHAT_VIEWS,
  CLIENT_VIEWS,
  MY_TASK_VIEWS,
  projectViews,
  REPORT_VIEWS,
  SERVICE_VIEWS,
  taskViewsFor,
  TRANSACTION_VIEWS,
  viewsFor,
  type ViewTab,
} from "./pageViews"

const navItemsFor = (role: UserRole) => getNavSections(role).flatMap((section) => section.items)

// The statuses a new agency starts with; the project tabs are built from the agency's own.
const DEFAULT_PROJECT_STATUSES = ["Planning", "Active", "Review", "On hold", "Completed"]

// Every set of tabs a page renders, as that role sees it.
const tabSetsFor = (role: UserRole): ViewTab[][] =>
  [
    CLIENT_VIEWS,
    taskViewsFor(role),
    MY_TASK_VIEWS,
    projectViews(DEFAULT_PROJECT_STATUSES),
    CHAT_VIEWS,
    TRANSACTION_VIEWS,
    SERVICE_VIEWS,
    REPORT_VIEWS,
  ].map((tabs) => viewsFor(tabs, role))

// What each sidebar linked to before the views moved into tabs on their pages.
// Every one must still open, with its page's entry and its own tab lit.
const SIDEBAR_BEFORE: Record<UserRole, string[]> = {
  admin: [
    "/admin/dashboard", "/admin/dashboard/sales", "/admin/dashboard/delivery",
    "/admin/dashboard/clients", "/admin/dashboard/clients?status=active",
    "/admin/dashboard/clients?status=inactive", "/admin/dashboard/clients?status=archived",
    "/admin/dashboard/leads", "/admin/dashboard/services", "/admin/dashboard/services/categories",
    "/admin/dashboard/services/templates", "/admin/dashboard/projects", "/admin/dashboard/tasks",
    "/admin/dashboard/tasks?view=list", "/admin/dashboard/tasks?view=calendar",
    "/admin/dashboard/tasks?status=In review", "/admin/dashboard/tasks?overdue=true",
    "/admin/dashboard/tasks?mine=true", "/admin/dashboard/team-management", "/admin/dashboard/departments",
    "/admin/dashboard/permissions", "/dashboard/timesheet", "/admin/dashboard/time-approvals",
    "/dashboard/attendance", "/dashboard/leave", "/dashboard/chat", "/dashboard/chat?unread=true",
    "/dashboard/chat?type=direct", "/dashboard/chat?type=group", "/dashboard/chat?archived=true",
    "/admin/dashboard/accounts", "/admin/dashboard/transactions", "/admin/dashboard/transactions?kind=income",
    "/admin/dashboard/transactions?kind=expense", "/admin/dashboard/transactions?kind=transfer",
    "/admin/dashboard/invoices", "/admin/dashboard/payments", "/admin/dashboard/expenses",
    "/admin/dashboard/exchange", "/admin/dashboard/payouts", "/admin/dashboard/withdrawals",
    "/admin/dashboard/due-payments", "/admin/dashboard/loans", "/admin/dashboard/shareholders",
    "/admin/dashboard/reports", "/admin/dashboard/reports/clients", "/admin/dashboard/reports/projects",
    "/admin/dashboard/reports/tasks", "/admin/dashboard/reports/team", "/admin/dashboard/reports/finance",
    "/admin/dashboard/payroll", "/admin/dashboard/business", "/admin/dashboard/notifications",
    "/admin/dashboard/security", "/admin/dashboard/project-settings", "/admin/dashboard/workflow",
    "/admin/dashboard/leave-settings", "/admin/dashboard/finance-config", "/admin/dashboard/targets",
    "/admin/dashboard/vault", "/admin/dashboard/activity", "/my-profile", "/change-password",
  ],
  sales: [
    "/admin/dashboard/sales", "/admin/dashboard/leads", "/admin/dashboard/clients",
    "/admin/dashboard/clients?status=active", "/admin/dashboard/clients?status=inactive",
    "/admin/dashboard/invoices", "/admin/dashboard/services", "/admin/dashboard/services/categories",
    "/admin/dashboard/services/templates", "/admin/dashboard/projects", "/admin/dashboard/tasks?mine=true",
    "/admin/dashboard/tasks?client_owner=me", "/dashboard/chat", "/dashboard/chat?type=direct",
    "/dashboard/chat?type=group", "/dashboard/chat?type=project", "/admin/dashboard/reports/clients",
    "/admin/dashboard/reports/sales", "/admin/dashboard/team-directory", "/dashboard/attendance",
    "/dashboard/leave", "/admin/dashboard/vault", "/my-profile", "/change-password",
  ],
  project_manager: [
    "/admin/dashboard/delivery", "/admin/dashboard/clients", "/admin/dashboard/clients?status=active",
    "/admin/dashboard/services", "/admin/dashboard/services/templates", "/admin/dashboard/projects",
    "/admin/dashboard/projects?mine=true", "/admin/dashboard/projects?status=Planning",
    "/admin/dashboard/projects?status=Active", "/admin/dashboard/projects?status=Review",
    "/admin/dashboard/projects?status=On hold", "/admin/dashboard/projects?status=Completed",
    "/admin/dashboard/tasks", "/admin/dashboard/tasks?mine=true", "/admin/dashboard/tasks?view=list",
    "/admin/dashboard/tasks?view=calendar", "/admin/dashboard/tasks?status=In review",
    "/admin/dashboard/tasks?overdue=true", "/admin/dashboard/team-directory", "/admin/dashboard/workload",
    "/admin/dashboard/availability", "/admin/dashboard/leave-calendar", "/dashboard/timesheet",
    "/admin/dashboard/time-approvals", "/dashboard/leave", "/dashboard/attendance", "/dashboard/chat",
    "/dashboard/chat?type=direct", "/dashboard/chat?type=group", "/dashboard/chat?type=project",
    "/dashboard/chat?archived=true", "/admin/dashboard/reports/projects", "/admin/dashboard/reports/tasks",
    "/admin/dashboard/reports/team", "/admin/dashboard/workflow", "/admin/dashboard/project-settings",
    "/admin/dashboard/vault", "/my-profile", "/change-password",
  ],
  operations: [
    "/dashboard", "/dashboard/tasks", "/dashboard/tasks?due=today", "/dashboard/tasks?due=upcoming",
    "/dashboard/tasks?overdue=true", "/dashboard/tasks?completed=true", "/dashboard/timesheet",
    "/admin/dashboard/projects?mine=true", "/admin/dashboard/clients", "/admin/dashboard/team-directory",
    "/dashboard/chat", "/dashboard/chat?type=direct", "/dashboard/chat?type=group",
    "/dashboard/chat?type=project", "/my-profile", "/dashboard/attendance", "/dashboard/leave",
    "/change-password",
  ],
  super_admin: [
    "/platform", "/platform/invite-agency", "/platform/customers", "/platform/active-users",
    "/platform/plans", "/platform/campaigns", "/platform/finance", "/platform/invite-operator",
    "/platform/permissions", "/platform/activity", "/platform/settings", "/my-profile", "/change-password",
  ],
}

const isAccountLink = (href: string) => ACCOUNT_LINKS.some((link) => link.href === href)

// "?status=On hold" and "?status=On+hold" are the same view, written two ways.
const normalised = (href: string) => {
  const query = new URLSearchParams(href.split("?")[1] ?? "")
  query.sort()
  return `${pathOf(href)}?${query}`
}
const sameView = (a: string, b: string) => normalised(a) === normalised(b)

describe.each(ALL_ROLES)("%s sidebar", (role) => {
  const items = navItemsFor(role)

  it("links only to pages the role may open", () => {
    for (const item of items) expect(canRoleReach(pathOf(item.href), role), item.href).toBe(true)
  })

  it("lights exactly the entry that was followed", () => {
    for (const item of items) {
      expect(activeNavHref(items, pathOf(item.href)), item.href).toBe(item.href)
    }
  })

  it("has one entry per destination", () => {
    const paths = items.map((item) => item.activePath ?? pathOf(item.href))
    expect(new Set(paths).size).toBe(paths.length)
  })

  it("still reaches every page its old sidebar linked, with that view's tab lit", () => {
    const tabSets = tabSetsFor(role)

    for (const oldHref of SIDEBAR_BEFORE[role]) {
      const [path, query = ""] = oldHref.split("?")
      expect(canRoleReach(path, role), oldHref).toBe(true)
      if (isAccountLink(oldHref)) continue

      expect(activeNavHref(items, path), `${oldHref} lights an entry`).not.toBeNull()

      const isNavHref = items.some((item) => item.href === oldHref)
      const tabs = tabSets.find((set) => set.some((tab) => sameView(tab.href, oldHref)))
      expect(isNavHref || tabs !== undefined, `${oldHref} is a nav entry or a tab`).toBe(true)
      if (!tabs) continue

      const lit = activeViewHref(
        tabs.map((tab) => tab.href),
        path,
        new URLSearchParams(query),
      )
      expect(lit !== null && sameView(lit, oldHref), `${oldHref} lights its tab`).toBe(true)
    }
  })
})

describe("account links", () => {
  it("open for every signed-in role", () => {
    for (const role of ALL_ROLES) {
      for (const link of ACCOUNT_LINKS) expect(canRoleReach(link.href, role)).toBe(true)
    }
  })
})

describe("the role homes", () => {
  it("light only on the home page itself", () => {
    expect(activeNavHref(navItemsFor("admin"), "/admin/dashboard")).toBe("/admin/dashboard")
    expect(activeNavHref(navItemsFor("admin"), "/admin/dashboard/clients/42")).toBe("/admin/dashboard/clients")
    expect(activeNavHref(navItemsFor("operations"), "/dashboard/chat")).toBe("/dashboard/chat")
    expect(activeNavHref(navItemsFor("super_admin"), "/platform/plans")).toBe("/platform/plans")
  })

  it("keep Reports lit on every report a role may open", () => {
    expect(activeNavHref(navItemsFor("sales"), "/admin/dashboard/reports/sales")).toBe(
      "/admin/dashboard/reports/clients",
    )
    expect(activeNavHref(navItemsFor("project_manager"), "/admin/dashboard/reports/team")).toBe(
      "/admin/dashboard/reports/projects",
    )
  })
})

describe("describeBadge", () => {
  it("says what the number counts", () => {
    expect(describeBadge("chatUnread", 1)).toBe("1 unread message")
    expect(describeBadge("chatUnread", 4)).toBe("4 unread messages")
    expect(describeBadge("pendingMembers", 1)).toBe("1 person waiting to join")
    expect(describeBadge("pendingMembers", 2)).toBe("2 people waiting to join")
  })
})
