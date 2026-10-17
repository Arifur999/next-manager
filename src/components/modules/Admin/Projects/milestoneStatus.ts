import type { IMilestone } from "@/types/project.types"
import { isAfter, parseISO } from "date-fns"

export const dayOf = (value: string) => parseISO(value.slice(0, 10))

export type MilestoneStatus = {
  label: string
  late: boolean
  tone: "outline" | "secondary" | "destructive"
}

export const statusOf = (milestone: IMilestone): MilestoneStatus => {
  if (milestone.submitted_at) {
    const late = isAfter(dayOf(milestone.submitted_at), dayOf(milestone.due_date))

    if (milestone.accepted_at) {
      return { label: late ? "accepted, late" : "accepted", late, tone: late ? "destructive" : "secondary" }
    }

    // Submitted and waiting. Worth its own state: delivered is not done, and
    // rolling the two together hides work sitting on a client's desk.
    return { label: late ? "submitted, late" : "submitted", late, tone: late ? "destructive" : "outline" }
  }

  if (isAfter(new Date(), dayOf(milestone.due_date))) {
    return { label: "overdue", late: true, tone: "destructive" }
  }

  return { label: "due", late: false, tone: "outline" }
}
