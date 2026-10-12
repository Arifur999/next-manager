// The signature section: one sample job followed through five modules. Numbers
// agree with each other on purpose (12.5 approved hours at the hourly rate are
// the hours line on the invoice; the payment settles that invoice).

export const LEDGER_TRACE_INTRO = {
  title: "One job, traced from the first call to the bank.",
  body: "Most tools hold one part of a project. Here a single job moves through every module, and each step leaves a row the next step reads.",
} as const

export const TRACE_JOB = {
  client: "Riverside Dental and Orthodontic Partners",
  project: "Riverside site rebuild",
  person: "Tanvir Ahmed",
  hourlyRateUsd: 64,
  approvedHours: 12.5,
  milestoneUsd: 4800,
  invoiceNumber: "INV-2045",
  exchangeRate: 121.4,
} as const

export const TRACE_INVOICE_TOTAL_USD = TRACE_JOB.milestoneUsd + TRACE_JOB.hourlyRateUsd * TRACE_JOB.approvedHours

export type TraceStepId = "lead" | "project" | "hours" | "invoice" | "payment"

export interface ITraceStep {
  id: TraceStepId
  module: string
  title: string
  caption: string
}

export const TRACE_STEPS: ITraceStep[] = [
  { id: "lead", module: "Leads", title: "Won", caption: "A dental practice asks for a site rebuild. Sales moves the lead to Won and it becomes a client." },
  { id: "project", module: "Projects", title: "Opened", caption: "Three milestones. The first is accepted; the design milestone is submitted for review." },
  { id: "hours", module: "Timesheet", title: "Approved", caption: "Hours are logged against the milestone. A project manager approves them." },
  { id: "invoice", module: "Invoices", title: "Billed in USD", caption: "The accepted milestone and the approved hours go onto one invoice." },
  { id: "payment", module: "Payments", title: "Banked in BDT", caption: "Paid in dollars, moved to the taka account. The exchange keeps its rate, so both figures stay true." },
]
