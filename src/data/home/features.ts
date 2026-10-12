// Five capability blocks. Every claim maps to a real route (listed per block),
// so nothing here promises a screen the product does not have.

export type FeatureId = "pipeline" | "delivery" | "time" | "money" | "people"

export interface IFeature {
  id: FeatureId
  area: string
  benefit: string
  body: string
  routes: string[]
}

export const FEATURES_INTRO = {
  title: "What each part of the business gets",
  body: "Five areas, one set of records. Each block below is a crop of the real screens, filled with sample data.",
} as const

export const FEATURES: IFeature[] = [
  {
    id: "pipeline",
    area: "Pipeline to client",
    benefit: "Know which leads are worth chasing.",
    body: "Move leads through your stages, see where they came from, and turn a won lead into a client in one step. Sell the same service packages again without rebuilding them.",
    routes: ["/admin/dashboard/leads", "/admin/dashboard/services/templates", "/admin/dashboard/clients"],
  },
  {
    id: "delivery",
    area: "Delivery",
    benefit: "See every project's next milestone.",
    body: "Projects carry milestones that are submitted and accepted. Tasks sit on boards with your own workflow columns, and the workload view shows who has room this week.",
    routes: ["/admin/dashboard/projects", "/admin/dashboard/tasks", "/admin/dashboard/workflow", "/admin/dashboard/workload"],
  },
  {
    id: "time",
    area: "Time",
    benefit: "Bill the hours your team really worked.",
    body: "People log time against projects. Managers clear an approval queue, and capacity per person shows when the week is already full.",
    routes: ["/dashboard/timesheet", "/admin/dashboard/time-approvals", "/admin/dashboard/availability"],
  },
  {
    id: "money",
    area: "Money",
    benefit: "Know this month's margin this month.",
    body: "Invoices, payments, expenses, team payouts, owner withdrawals, dues, loans and shareholders all post to USD and BDT accounts with recorded rates. Profit and loss and cash flow read from the same rows.",
    routes: [
      "/admin/dashboard/invoices",
      "/admin/dashboard/payments",
      "/admin/dashboard/expenses",
      "/admin/dashboard/payouts",
      "/admin/dashboard/withdrawals",
      "/admin/dashboard/due-payments",
      "/admin/dashboard/loans",
      "/admin/dashboard/shareholders",
      "/admin/dashboard/accounts",
      "/admin/dashboard/exchange",
      "/admin/dashboard/reports/finance",
    ],
  },
  {
    id: "people",
    area: "People",
    benefit: "Run the team from the same place.",
    body: "Attendance, leave with balances and a calendar, departments and team chat. Payroll runs post their payouts straight to the ledger.",
    routes: ["/dashboard/attendance", "/dashboard/leave", "/admin/dashboard/leave-calendar", "/admin/dashboard/payroll", "/admin/dashboard/departments", "/dashboard/chat"],
  },
]
