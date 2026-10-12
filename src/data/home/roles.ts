import type { UserRole } from "@/lib/authUtils"
import type { PermissionScope } from "@/types/permission.types"

// What each workspace role can open. Every route listed here is checked
// against the route table (canRoleReach) by src/data/home/content.test.ts, so
// this section cannot promise a door the app keeps shut.

export const ROLES_INTRO = {
  title: "Your sales team never sees payroll.",
  body: "Four workspace roles decide which screens open at all. A per-person grid then decides how much of each list someone sees.",
} as const

export interface IRoleColumn {
  role: Exclude<UserRole, "super_admin">
  name: string
  summary: string
  opens: Array<{ label: string; route: string }>
}

export const ROLE_COLUMNS: IRoleColumn[] = [
  {
    role: "admin",
    name: "Admin",
    summary: "Runs the company and the money.",
    opens: [
      { label: "Accounts and transactions", route: "/admin/dashboard/accounts" },
      { label: "Payroll and payouts", route: "/admin/dashboard/payroll" },
      { label: "Finance reports", route: "/admin/dashboard/reports/finance" },
      { label: "Roles and permissions", route: "/admin/dashboard/permissions" },
    ],
  },
  {
    role: "sales",
    name: "Sales",
    summary: "Wins the work and bills it.",
    opens: [
      { label: "Leads", route: "/admin/dashboard/leads" },
      { label: "Clients", route: "/admin/dashboard/clients" },
      { label: "Invoices", route: "/admin/dashboard/invoices" },
      { label: "Sales and client reports", route: "/admin/dashboard/reports/sales" },
    ],
  },
  {
    role: "project_manager",
    name: "Project manager",
    summary: "Delivers the work on time.",
    opens: [
      { label: "Projects and tasks", route: "/admin/dashboard/projects" },
      { label: "Time approvals", route: "/admin/dashboard/time-approvals" },
      { label: "Workload", route: "/admin/dashboard/workload" },
      { label: "Project and team reports", route: "/admin/dashboard/reports/projects" },
    ],
  },
  {
    role: "operations",
    name: "Operations",
    summary: "Does the work and logs it.",
    opens: [
      { label: "Their tasks", route: "/dashboard/tasks" },
      { label: "Timesheet", route: "/dashboard/timesheet" },
      { label: "Attendance and leave", route: "/dashboard/leave" },
      { label: "Team chat", route: "/dashboard/chat" },
    ],
  },
]

/** Routes a role must NOT reach; also asserted in content.test.ts. */
export const ROLE_CLOSED_EXAMPLES: Array<{ role: IRoleColumn["role"]; route: string }> = [
  { role: "sales", route: "/admin/dashboard/payroll" },
  { role: "sales", route: "/admin/dashboard/accounts" },
  { role: "project_manager", route: "/admin/dashboard/payroll" },
  { role: "operations", route: "/admin/dashboard/invoices" },
]

// Default "view" scope for a new workspace, copied from the server's role
// defaults. Every cell can be changed per role and per person.
export const SCOPE_GRID: Array<{ module: string; scopes: Record<IRoleColumn["role"], PermissionScope> }> = [
  { module: "Clients", scopes: { admin: "all", sales: "all", project_manager: "all", operations: "assigned" } },
  { module: "Projects", scopes: { admin: "all", sales: "all", project_manager: "all", operations: "assigned" } },
  { module: "Tasks", scopes: { admin: "all", sales: "all", project_manager: "all", operations: "own" } },
  { module: "Invoices", scopes: { admin: "all", sales: "all", project_manager: "none", operations: "none" } },
  { module: "Accounts", scopes: { admin: "all", sales: "none", project_manager: "none", operations: "none" } },
  { module: "Time", scopes: { admin: "all", sales: "own", project_manager: "all", operations: "own" } },
]

export const SCOPE_OVERRIDE_EXAMPLE = {
  person: "Maria Okafor",
  role: "Sales",
  module: "Clients",
  scope: "own" as PermissionScope,
  note: "A per-person override: this salesperson sees only the clients she holds.",
}

export const SECURITY_POINTS = [
  { title: "Encrypted vault", body: "Client passwords are encrypted before they are saved. Every reveal is logged with who and when." },
  { title: "Activity trail", body: "Who created, changed or deleted what, in words recorded at the time. Nobody can edit it." },
  { title: "Sign-in history", body: "Every sign-in, including failed attempts, so a guessed password does not go unnoticed." },
  { title: "Session cookies", body: "Sessions live in httpOnly cookies that scripts in the browser cannot read." },
]
