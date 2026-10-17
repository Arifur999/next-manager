import { toDate } from "@/lib/dates"
import type { StatusCategory } from "@/types/common.types"
import type { ITask } from "@/types/work.types"
import { isBefore, startOfToday } from "date-fns"

// Finished or cancelled work is never late: the same rule as the API's
// ?overdue=true, so a card and the Overdue view cannot disagree.
const CLOSED: StatusCategory[] = ["done", "cancelled"]

// Read from the date rather than a stored flag: nothing has to run for a day to pass.
export const isTaskOverdue = (task: Pick<ITask, "due_date" | "status">, today: Date = startOfToday()): boolean =>
  task.due_date !== null && !CLOSED.includes(task.status.category) && isBefore(toDate(task.due_date), today)
