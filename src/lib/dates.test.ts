import { format } from "date-fns"
import { afterEach, describe, expect, it } from "vitest"
import { isCalendarDay, toDate } from "./dates"

const originalTimeZone = process.env.TZ

describe("toDate", () => {
  afterEach(() => {
    process.env.TZ = originalTimeZone
  })

  // Regression: DateCell used new Date(), so a payment dated 1 Sep showed as
  // 31 Aug for anyone west of Greenwich.
  it("keeps a calendar day on the same day west of Greenwich", () => {
    process.env.TZ = "America/New_York"
    expect(format(toDate("2026-09-01"), "yyyy-MM-dd")).toBe("2026-09-01")
  })

  it("parses a full timestamp to the same instant", () => {
    expect(toDate("2026-10-17T01:57:48.785Z").toISOString()).toBe("2026-10-17T01:57:48.785Z")
  })

  it("passes a Date through", () => {
    const date = new Date("2026-01-02T03:04:05Z")
    expect(toDate(date)).toBe(date)
  })
})

describe("isCalendarDay", () => {
  it("accepts a real day", () => {
    expect(isCalendarDay("2026-02-28")).toBe(true)
    expect(isCalendarDay("2028-02-29")).toBe(true)
  })

  it("rejects text, impossible days and other formats", () => {
    expect(isCalendarDay("x")).toBe(false)
    expect(isCalendarDay("2026-13-01")).toBe(false)
    expect(isCalendarDay("2026-02-31")).toBe(false)
    expect(isCalendarDay("17/10/2026")).toBe(false)
  })
})
