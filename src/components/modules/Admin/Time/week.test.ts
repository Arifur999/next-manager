import { describe, expect, it } from "vitest"
import { isoDay, weekLabel, weekStart } from "./week"

// A Wednesday.
const today = new Date("2026-10-14T10:00:00Z")

describe("weekStart", () => {
  it("starts the current week on Monday", () => {
    expect(isoDay(weekStart(0, today))).toBe("2026-10-12")
  })

  it("steps back a week at a time", () => {
    expect(isoDay(weekStart(-1, today))).toBe("2026-10-05")
  })

  it("puts a Sunday in the week that began the Monday before", () => {
    expect(isoDay(weekStart(0, new Date("2026-10-18T10:00:00Z")))).toBe("2026-10-12")
  })
})

describe("weekLabel", () => {
  it("names this week and last week, and dates the rest", () => {
    expect(weekLabel(0, weekStart(0, today))).toBe("This week")
    expect(weekLabel(-1, weekStart(-1, today))).toBe("Last week")
    expect(weekLabel(-3, weekStart(-3, today))).toBe("Week of Sep 21")
  })
})
