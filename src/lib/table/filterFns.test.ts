import type { Row } from "@tanstack/react-table"
import { describe, expect, it } from "vitest"
import { smartColumnFilterFn } from "./filterFns"

// The filter only reads the cell through getValue, so a row is just that.
const rowWith = (value: unknown): Pick<Row<unknown>, "getValue"> => ({ getValue: <TValue,>() => value as TValue })
const matches = (cellValue: unknown, filterValue: unknown) =>
  smartColumnFilterFn(rowWith(cellValue) as Row<unknown>, "column", filterValue, () => {})

describe("smartColumnFilterFn", () => {
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
