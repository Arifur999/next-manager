import { describe, expect, it } from "vitest"
import { periodQueryString, presetOf, rangeOf } from "./reportPeriod"

const today = new Date(2026, 9, 17)

describe("rangeOf", () => {
  it("covers whole months, quarters and years around today", () => {
    expect(rangeOf("this-month", today)).toEqual({ from: "2026-10-01", to: "2026-10-31" })
    expect(rangeOf("last-month", today)).toEqual({ from: "2026-09-01", to: "2026-09-30" })
    expect(rangeOf("this-quarter", today)).toEqual({ from: "2026-10-01", to: "2026-12-31" })
    expect(rangeOf("last-quarter", today)).toEqual({ from: "2026-07-01", to: "2026-09-30" })
    expect(rangeOf("last-year", today)).toEqual({ from: "2025-01-01", to: "2025-12-31" })
  })

  it("leaves all time unbounded", () => {
    expect(rangeOf("all", today)).toBeNull()
  })
})

describe("periodQueryString", () => {
  it("passes real days through in a fixed order", () => {
    expect(periodQueryString({ to: "2026-10-31", from: "2026-10-01", page: "2" })).toBe("from=2026-10-01&to=2026-10-31")
  })

  it("drops anything that is not a real day", () => {
    expect(periodQueryString({ from: "2026-02-31", to: ["2026-01-01"] })).toBe("")
    expect(periodQueryString({})).toBe("")
  })
})

describe("presetOf", () => {
  it("recognises a preset's range and calls anything else custom", () => {
    expect(presetOf(undefined, undefined, today)).toBe("all")
    expect(presetOf("2026-07-01", "2026-09-30", today)).toBe("last-quarter")
    expect(presetOf("2026-10-05", "2026-10-09", today)).toBe("custom")
  })
})
