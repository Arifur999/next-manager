import { format } from "date-fns"
import { afterEach, describe, expect, it } from "vitest"
import {
  formatDateTime,
  formatDay,
  formatDayShort,
  formatHours,
  formatRange,
  isCalendarDay,
  toDate,
  todayIsoDate,
} from "./dates"

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

describe("todayIsoDate", () => {
  const originalTimeZone = process.env.TZ

  afterEach(() => {
    process.env.TZ = originalTimeZone
  })

  // Regression: forms seeded the date from toISOString(), the UTC day, so a
  // payment recorded in Dhaka before 6am defaulted to yesterday.
  it("is the local day, not the UTC day, early in the morning in Dhaka", () => {
    process.env.TZ = "Asia/Dhaka"
    const twoThirtyInDhaka = new Date("2026-10-16T20:30:00Z")
    expect(twoThirtyInDhaka.toISOString().slice(0, 10)).toBe("2026-10-16")
    expect(todayIsoDate(twoThirtyInDhaka)).toBe("2026-10-17")
  })
})

describe("formatDay", () => {
  afterEach(() => {
    process.env.TZ = originalTimeZone
  })

  it("writes the day first with a short month", () => {
    expect(formatDay("2026-10-17")).toBe("17 Oct 2026")
  })

  it("keeps a calendar day on its day west of Greenwich", () => {
    process.env.TZ = "America/New_York"
    expect(formatDay("2026-09-01")).toBe("1 Sep 2026")
  })

  it("takes a Date", () => {
    expect(formatDay(new Date(2026, 0, 5))).toBe("5 Jan 2026")
  })
})

describe("formatDayShort", () => {
  it("drops the year", () => {
    expect(formatDayShort("2026-10-17")).toBe("17 Oct")
  })
})

describe("formatDateTime", () => {
  it("adds a 24-hour time", () => {
    expect(formatDateTime("2026-10-17T14:05:00Z")).toBe("17 Oct 2026, 14:05")
  })
})

describe("formatRange", () => {
  it("writes one day once", () => {
    expect(formatRange("2026-10-17", "2026-10-17")).toBe("17 Oct 2026")
  })

  it("shares the month and year inside one month", () => {
    expect(formatRange("2026-10-17", "2026-10-24")).toBe("17–24 Oct 2026")
  })

  it("shares the year across months", () => {
    expect(formatRange("2026-10-28", "2026-11-03")).toBe("28 Oct – 3 Nov 2026")
  })

  it("writes both years across a new year", () => {
    expect(formatRange("2026-12-28", "2027-01-03")).toBe("28 Dec 2026 – 3 Jan 2027")
  })
})

describe("formatHours", () => {
  it("trims trailing zeros and keeps quarter hours", () => {
    expect(formatHours(8)).toBe("8 h")
    expect(formatHours(7.5)).toBe("7.5 h")
    expect(formatHours(7.25)).toBe("7.25 h")
    expect(formatHours(0)).toBe("0 h")
  })

  it("rounds to two decimals and groups thousands", () => {
    expect(formatHours(1.333333)).toBe("1.33 h")
    expect(formatHours(1234.5)).toBe("1,234.5 h")
  })
})
