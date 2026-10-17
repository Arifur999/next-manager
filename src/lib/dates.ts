import { format, isValid, parseISO } from "date-fns"

// The API sends calendar days as "2026-09-01". new Date() reads that as
// midnight UTC, which is the previous evening west of Greenwich; parseISO
// reads it as a local day, so the day shown is the day stored everywhere.
// Full timestamps parse to the same instant either way.
export const toDate = (value: string | Date): Date => (typeof value === "string" ? parseISO(value) : value)

// Today as the user's own calendar day. toISOString() would give the UTC day,
// which in Dhaka is still yesterday until 6am.
export const todayIsoDate = (now: Date = new Date()): string => format(now, "yyyy-MM-dd")

// A real YYYY-MM-DD day: "2026-02-31" parses but is not one, so it must
// format back to itself.
export const isCalendarDay = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = parseISO(value)
  return isValid(date) && format(date, "yyyy-MM-dd") === value
}
