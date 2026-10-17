import { format, isSameDay, isSameMonth, isSameYear, isValid, parseISO } from "date-fns"

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

// One way to write a day across the app, day first so it reads the same in
// Dhaka and in London: "17 Oct 2026".
export const formatDay = (value: string | Date): string => format(toDate(value), "d MMM yyyy")

// "17 Oct", for a week strip or an axis where the year is already obvious.
export const formatDayShort = (value: string | Date): string => format(toDate(value), "d MMM")

// "17 Oct 2026, 14:05": the 24-hour clock the rest of the app already uses.
export const formatDateTime = (value: string | Date): string => format(toDate(value), "d MMM yyyy, HH:mm")

// "17–24 Oct 2026", "28 Oct – 3 Nov 2026", "28 Dec 2026 – 3 Jan 2027": what
// both ends share is written once.
export const formatRange = (from: string | Date, to: string | Date): string => {
  const start = toDate(from)
  const end = toDate(to)

  if (isSameDay(start, end)) return formatDay(end)
  if (isSameMonth(start, end)) return `${format(start, "d")}–${formatDay(end)}`
  if (isSameYear(start, end)) return `${formatDayShort(start)} – ${formatDay(end)}`
  return `${formatDay(start)} – ${formatDay(end)}`
}

// "7.5 h": quarter hours need two decimals, trailing zeros say nothing, and
// the non-breaking space keeps the unit from wrapping away from the figure.
export const formatHours = (hours: number): string =>
  `${hours.toLocaleString("en-US", { maximumFractionDigits: 2 })} h`
