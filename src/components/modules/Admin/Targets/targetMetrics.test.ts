import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { periodStart, specOf } from "./targetMetrics"

describe("periodStart", () => {
    beforeEach(() => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date("2026-08-17T10:00:00"))
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it("starts a month on its first day", () => {
        expect(periodStart("month")).toBe("2026-08-01")
    })

    it("starts a quarter in January, April, July or October", () => {
        expect(periodStart("quarter")).toBe("2026-07-01")
    })

    it("starts a year in January", () => {
        expect(periodStart("year")).toBe("2026-01-01")
    })
})

describe("specOf", () => {
    it("finds a known metric's label and unit", () => {
        expect(specOf("utilization_pct")).toMatchObject({ label: "Utilization", unit: "%" })
    })
})
