// A real sequence, so the steps are numbered. Each names the role that does it
// and the row it leaves behind, using the sample job from the ledger trace.
export const WORKFLOW = {
  title: "From signed lead to paid invoice.",
  intro: "Six steps, four roles, one set of rows. Nobody re-types what the step before them already recorded.",
} as const

export interface IWorkflowStep {
  title: string
  role: string
  body: string
  /** The record this step leaves, as the cells of one ledger row. */
  row: string[]
}

export const WORKFLOW_STEPS: IWorkflowStep[] = [
  {
    title: "Win the lead",
    role: "Sales",
    body: "Move the lead to Won. The client record is created from it, with its source kept.",
    row: ["Lead", "Riverside Dental", "Won", "Referral"],
  },
  {
    title: "Open the project",
    role: "Admin or project manager",
    body: "Add milestones and the people on the job. The client and the service package carry over.",
    row: ["Project", "Riverside site rebuild", "3 milestones"],
  },
  {
    title: "Log and approve time",
    role: "The team, then the project manager",
    body: "People log hours against the project. They wait in the approval queue until someone signs them off.",
    row: ["Time", "Tanvir Ahmed", "12.50 h", "Approved"],
  },
  {
    title: "Invoice the client",
    role: "Admin",
    body: "Approved hours and accepted milestones become invoice lines, in the client's currency.",
    row: ["Invoice", "INV-2045", "$5,600.00", "Sent"],
  },
  {
    title: "Record the payment",
    role: "Admin or operations",
    body: "The money lands in the right account in its own currency. An exchange to taka keeps its rate.",
    row: ["Payment", "$5,600.00 in", "BDT at 121.40"],
  },
  {
    title: "See the margin",
    role: "Admin",
    body: "Project profit and cash flow update from the rows above, the same day.",
    row: ["Report", "Riverside site rebuild", "Margin updated"],
  },
]
