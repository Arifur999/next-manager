import { ALL_ROLES } from "@/lib/authUtils"
import type { Currency } from "@/types/common.types"
import { SCOPE_VALUES } from "@/types/permission.types"

// The module list is the single source for the band and its counts. The other
// counts come from the code that enforces them, so the page cannot drift.
export const MODULES = [
  "Clients",
  "Leads",
  "Services",
  "Projects",
  "Milestones",
  "Tasks",
  "Time",
  "Invoices",
  "Payments",
  "Expenses",
  "Ledger and exchange",
  "Payroll",
  "Attendance and leave",
  "Loans and shareholders",
  "Vault",
  "Chat",
  "KPIs and reports",
] as const

export const WORKSPACE_ROLES = ALL_ROLES.filter((role) => role !== "super_admin")

export const CURRENCIES = ["USD", "BDT"] as const satisfies readonly Currency[]

export const MODULE_FACTS = [
  { value: MODULES.length, label: "modules" },
  { value: WORKSPACE_ROLES.length, label: "workspace roles" },
  { value: CURRENCIES.length, label: "currencies" },
  { value: SCOPE_VALUES.length, label: "permission scopes" },
] as const
