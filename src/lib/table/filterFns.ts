import type { FilterFn } from "@tanstack/react-table"

export interface DateRangeValue {
  from?: string
  to?: string
}

const isDateRange = (value: unknown): value is DateRangeValue =>
  typeof value === "object" && value !== null && !Array.isArray(value) && ("from" in value || "to" in value)

// Inclusive on both ends, by calendar day: `to` covers the whole of that day.
const isWithinDateRange = (cellValue: unknown, { from, to }: DateRangeValue) => {
  if (!cellValue) return false
  const time = new Date(String(cellValue)).getTime()
  if (Number.isNaN(time)) return false
  if (from && time < new Date(`${from}T00:00:00`).getTime()) return false
  if (to && time > new Date(`${to}T23:59:59.999`).getTime()) return false
  return true
}

// The filter every in-memory DataTable column uses, chosen by the shape of the
// filter value, so a columns file never picks one:
//   string[]       the cell equals one of the selected options (a cell holding
//                  several values matches when any of them is selected)
//   { from, to }   the cell's date falls inside the range
//   string         case-insensitive "contains"
export const smartColumnFilterFn: FilterFn<unknown> = (row, columnId, filterValue) => {
  const cellValue = row.getValue(columnId)

  if (Array.isArray(filterValue)) {
    if (filterValue.length === 0) return true
    return Array.isArray(cellValue)
      ? cellValue.some((value) => filterValue.includes(String(value)))
      : filterValue.includes(String(cellValue))
  }
  if (isDateRange(filterValue)) return isWithinDateRange(cellValue, filterValue)
  if (typeof filterValue === "string") return String(cellValue ?? "").toLowerCase().includes(filterValue.toLowerCase())
  return true
}

// An empty selection or range removes the filter instead of matching nothing.
smartColumnFilterFn.autoRemove = (value: unknown) =>
  value === undefined ||
  value === "" ||
  (Array.isArray(value) && value.length === 0) ||
  (isDateRange(value) && !value.from && !value.to)
