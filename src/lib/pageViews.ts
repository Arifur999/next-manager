import { canRoleReach, type UserRole } from "./authUtils"
import { pathOf } from "./navMatch"

export type ViewTab = { label: string; href: string }

/**
 * The views of one page, as data: the tabs on the page rather than entries in
 * the sidebar. Every href is the URL the sidebar used to link, so a bookmark
 * or a shared link from before still opens the same view, now with its tab lit.
 */

export const CLIENT_VIEWS: ViewTab[] = [
  { label: "All", href: "/admin/dashboard/clients" },
  { label: "Active", href: "/admin/dashboard/clients?status=active" },
  { label: "Inactive", href: "/admin/dashboard/clients?status=inactive" },
  { label: "Archived", href: "/admin/dashboard/clients?status=archived" },
]

// Review is by status NAME: a static link cannot carry an id that differs per agency.
const TASK_VIEWS: ViewTab[] = [
  { label: "Board", href: "/admin/dashboard/tasks" },
  { label: "List", href: "/admin/dashboard/tasks?view=list" },
  { label: "Calendar", href: "/admin/dashboard/tasks?view=calendar" },
  { label: "Mine", href: "/admin/dashboard/tasks?mine=true" },
  { label: "Review", href: "/admin/dashboard/tasks?status=In review" },
  { label: "Overdue", href: "/admin/dashboard/tasks?overdue=true" },
]

// Work inside the clients a salesperson brought in, whoever is doing it: the
// question a seller actually has, and only theirs to ask.
const SALES_TASK_VIEW: ViewTab = { label: "My clients", href: "/admin/dashboard/tasks?client_owner=me" }

// Work nobody holds yet: triage for the two roles that hand work out.
const UNASSIGNED_TASK_VIEW: ViewTab = { label: "Unassigned", href: "/admin/dashboard/tasks?unassigned=true" }

export const taskViewsFor = (role: UserRole): ViewTab[] => {
  if (role === "sales") return [...TASK_VIEWS, SALES_TASK_VIEW]
  if (role === "admin" || role === "project_manager") return [...TASK_VIEWS, UNASSIGNED_TASK_VIEW]
  return TASK_VIEWS
}

// Somebody's own tasks. "Upcoming" is a seven-day window decided by the server.
export const MY_TASK_VIEWS: ViewTab[] = [
  { label: "All", href: "/dashboard/tasks" },
  { label: "Due today", href: "/dashboard/tasks?due=today" },
  { label: "Upcoming", href: "/dashboard/tasks?due=upcoming" },
  { label: "Overdue", href: "/dashboard/tasks?overdue=true" },
  { label: "Completed", href: "/dashboard/tasks?completed=true" },
]

// By status NAME, from the agency's own board, so a renamed column is a renamed tab.
export const projectViews = (statusNames: string[]): ViewTab[] => [
  { label: "All", href: "/admin/dashboard/projects" },
  { label: "Mine", href: "/admin/dashboard/projects?mine=true" },
  ...statusNames.map((name) => ({
    label: name,
    href: `/admin/dashboard/projects?${new URLSearchParams({ status: name })}`,
  })),
]

export const CHAT_VIEWS: ViewTab[] = [
  { label: "All", href: "/dashboard/chat" },
  { label: "Unread", href: "/dashboard/chat?unread=true" },
  { label: "Direct", href: "/dashboard/chat?type=direct" },
  { label: "Groups", href: "/dashboard/chat?type=group" },
  { label: "Project", href: "/dashboard/chat?type=project" },
  { label: "Archived", href: "/dashboard/chat?archived=true" },
]

export const TRANSACTION_VIEWS: ViewTab[] = [
  { label: "All", href: "/admin/dashboard/transactions" },
  { label: "Income", href: "/admin/dashboard/transactions?kind=income" },
  { label: "Expenses", href: "/admin/dashboard/transactions?kind=expense" },
  { label: "Transfers", href: "/admin/dashboard/transactions?kind=transfer" },
]

export const SERVICE_VIEWS: ViewTab[] = [
  { label: "Services", href: "/admin/dashboard/services" },
  { label: "Categories", href: "/admin/dashboard/services/categories" },
  { label: "Packages", href: "/admin/dashboard/services/templates" },
]

// Each report is its own page with its own role rule; viewsFor keeps the ones
// the reader may open.
export const REPORT_VIEWS: ViewTab[] = [
  { label: "Business", href: "/admin/dashboard/reports" },
  { label: "Clients", href: "/admin/dashboard/reports/clients" },
  { label: "Sales", href: "/admin/dashboard/reports/sales" },
  { label: "Projects", href: "/admin/dashboard/reports/projects" },
  { label: "Tasks", href: "/admin/dashboard/reports/tasks" },
  { label: "Team", href: "/admin/dashboard/reports/team" },
  { label: "Finance", href: "/admin/dashboard/reports/finance" },
]

/** The tabs this role can open: the route table decides, so a tab never bounces. */
export const viewsFor = (views: ViewTab[], role: UserRole): ViewTab[] =>
  views.filter((view) => canRoleReach(pathOf(view.href), role))
