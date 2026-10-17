import { buildQueryString } from "@/lib/queryString"
import { isCalendarDay, todayIsoDate } from "@/lib/dates"
import {
  endOfMonth,
  endOfQuarter,
  endOfYear,
  startOfMonth,
  startOfQuarter,
  startOfYear,
  subMonths,
  subQuarters,
  subYears,
} from "date-fns"

export const REPORT_PERIODS = [
  { value: "all", label: "All time" },
  { value: "this-month", label: "This month" },
  { value: "last-month", label: "Last month" },
  { value: "this-quarter", label: "This quarter" },
  { value: "last-quarter", label: "Last quarter" },
  { value: "this-year", label: "This year" },
  { value: "last-year", label: "Last year" },
] as const

export type ReportPeriodPreset = (typeof REPORT_PERIODS)[number]["value"]
export type ReportRange = { from: string; to: string }

const day = (date: Date) => todayIsoDate(date)
const span = (start: Date, end: Date): ReportRange => ({ from: day(start), to: day(end) })

// The days a preset covers, in the reader's own calendar. "All time" has none.
export const rangeOf = (preset: ReportPeriodPreset, today: Date = new Date()): ReportRange | null => {
  switch (preset) {
    case "all":
      return null
    case "this-month":
      return span(startOfMonth(today), endOfMonth(today))
    case "last-month":
      return span(startOfMonth(subMonths(today, 1)), endOfMonth(subMonths(today, 1)))
    case "this-quarter":
      return span(startOfQuarter(today), endOfQuarter(today))
    case "last-quarter":
      return span(startOfQuarter(subQuarters(today, 1)), endOfQuarter(subQuarters(today, 1)))
    case "this-year":
      return span(startOfYear(today), endOfYear(today))
    case "last-year":
      return span(startOfYear(subYears(today, 1)), endOfYear(subYears(today, 1)))
  }
}

type PeriodParams = Record<string, string | string[] | null | undefined>

const dayParam = (value: string | string[] | null | undefined) =>
  typeof value === "string" && isCalendarDay(value) ? value : undefined

/**
 * `from=…&to=…` for a report query, from the page's URL. A value that is not a
 * real day is dropped, so a hand-edited link reads as all time rather than an error.
 */
export const periodQueryString = (params: PeriodParams): string =>
  buildQueryString({ from: dayParam(params.from), to: dayParam(params.to) })

// The preset a URL's range matches, or "custom" for any other pair of days.
export const presetOf = (from: string | undefined, to: string | undefined, today: Date = new Date()) => {
  if (!from && !to) return "all"
  const match = REPORT_PERIODS.find(({ value }) => {
    const range = rangeOf(value, today)
    return range?.from === from && range?.to === to
  })
  return match?.value ?? "custom"
}
