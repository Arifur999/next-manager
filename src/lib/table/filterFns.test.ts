import type { Row } from "@tanstack/react-table"
import { afterEach, describe, expect, it } from "vitest"
import { createSmartColumnFilterFn } from "./filterFns"

const smartColumnFilterFn = createSmartColumnFilterFn<unknown>()

// The filter only reads the cell through getValue, so a row is just that.
const rowWith = (value: unknown): Pick<Row<unknown>, "getValue"> => ({ getValue: <TValue,>() => value as TValue })
const matches = (cellValue: unknown, filterValue: unknown) =>
  smartColumnFilterFn(rowWith(cellValue) as Row<unknown>, "column", filterValue, () => {})

describe("createSmartColumnFilterFn", () => {
  it("matches a faceted selection by equality", () => {
    expect(matches("paid", ["paid", "sent"])).toBe(true)
    expect(matches("draft", ["paid"])).toBe(false)
  })

  it("matches a cell with several values when any is selected", () => {
    expect(matches(["design", "build"], ["build"])).toBe(true)
    expect(matches(["design"], ["build"])).toBe(false)
  })

  it("treats an empty selection as no filter", () => {
    expect(matches("anything", [])).toBe(true)
  })

  it("does a case-insensitive contains for text", () => {
    expect(matches("Office rent", "RENT")).toBe(true)
    expect(matches(null, "rent")).toBe(false)
  })

  // Regression: cells were parsed as UTC midnight, so in New York a row shown
  // as 1 Sep was dropped by a range starting 1 Sep.
  describe("west of Greenwich", () => {
    const originalTimeZone = process.env.TZ
    afterEach(() => {
      process.env.TZ = originalTimeZone
    })

    it("keeps a calendar day inside a range that starts on it", () => {
      process.env.TZ = "America/New_York"
      expect(matches("2026-09-01", { from: "2026-09-01" })).toBe(true)
      expect(matches("2026-09-01", { to: "2026-08-31" })).toBe(false)
    })
  })

  it("keeps dates inside an inclusive day range", () => {
    expect(matches("2026-10-11", { from: "2026-10-01", to: "2026-10-11" })).toBe(true)
    expect(matches("2026-10-11T23:30:00", { to: "2026-10-11" })).toBe(true)
    expect(matches("2026-09-30", { from: "2026-10-01" })).toBe(false)
    expect(matches(null, { from: "2026-10-01" })).toBe(false)
  })

  it("removes empty filter values instead of matching nothing", () => {
    const autoRemove = smartColumnFilterFn.autoRemove
    expect(autoRemove?.("")).toBe(true)
    expect(autoRemove?.([])).toBe(true)
    expect(autoRemove?.({ from: "", to: "" })).toBe(true)
    expect(autoRemove?.(["paid"])).toBe(false)
  })
})
