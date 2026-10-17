import type { StatusCategory } from "@/types/common.types"
import type { IMilestone } from "@/types/project.types"
import { isAfter, isBefore, parseISO, startOfToday } from "date-fns"

export const dayOf = (value: string) => parseISO(value.slice(0, 10))

// `category` is how StatusBadge styles it: work still owed while late reads as a warning.
export type MilestoneStatus = {
  label: string
  late: boolean
  category: StatusCategory
}

export const statusOf = (milestone: IMilestone): MilestoneStatus => {
  if (milestone.submitted_at) {
    const late = isAfter(dayOf(milestone.submitted_at), dayOf(milestone.due_date))

    if (milestone.accepted_at) {
      return { label: late ? "accepted, late" : "accepted", late, category: "done" }
    }

    // Submitted and waiting. Worth its own state: delivered is not done, and
    // rolling the two together hides work sitting on a client's desk.
    return { label: late ? "submitted, late" : "submitted", late, category: late ? "blocked" : "active" }
  }

  // Overdue once the due day is over, not from its first minute: a delivery on
  // the due day still counts as on time.
  if (isBefore(dayOf(milestone.due_date), startOfToday())) {
    return { label: "overdue", late: true, category: "blocked" }
  }

  return { label: "due", late: false, category: "open" }
}
