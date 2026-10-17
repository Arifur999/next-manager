import { addDays, format, startOfWeek } from "date-fns"

/** The YYYY-MM-DD form the time API filters and dates entries by. */
export const isoDay = (date: Date) => format(date, "yyyy-MM-dd")

// Weeks start Monday: a timesheet that starts Sunday puts the weekend at both
// ends and nobody reads it that way.
export const weekStart = (offset: number, today = new Date()) =>
  startOfWeek(addDays(today, offset * 7), { weekStartsOn: 1 })

export const weekLabel = (offset: number, start: Date) => {
  if (offset === 0) return "This week"
  if (offset === -1) return "Last week"
  return format(start, "'Week of' MMM dd")
}
