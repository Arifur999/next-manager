import { describe, expect, it } from "vitest"
import { AGENCY_WIDE_TARGET, setKpiTargetServerZodSchema } from "./insights.validation"

describe("setKpiTargetServerZodSchema", () => {
    const target = {
        metric: "utilization_pct",
        period: "quarter",
        owner: AGENCY_WIDE_TARGET,
        target_value: "70",
        period_start: "2026-10-01",
    }

    it("builds an agency-wide target with no user", () => {
        expect(setKpiTargetServerZodSchema.parse(target)).toEqual({
            metric: "utilization_pct",
            period: "quarter",
            period_start: "2026-10-01",
            target_value: 70,
            user_id: null,
        })
    })

    it("gives a personal target to the chosen person", () => {
        expect(setKpiTargetServerZodSchema.parse({ ...target, owner: "u1" }).user_id).toBe("u1")
    })

    it("accepts a target of zero", () => {
        expect(setKpiTargetServerZodSchema.parse({ ...target, target_value: "0" }).target_value).toBe(0)
    })

    it("refuses a blank, non-numeric or negative target", () => {
        const messageFor = (target_value: string) =>
            setKpiTargetServerZodSchema.safeParse({ ...target, target_value }).error?.issues[0]?.message
        expect(messageFor(" ")).toBe("Enter a target")
        expect(messageFor("lots")).toBe("The target must be a number")
        expect(messageFor("-5")).toBe("Target cannot be negative")
    })

    it("refuses a metric or period the API does not know", () => {
        expect(setKpiTargetServerZodSchema.safeParse({ ...target, metric: "happiness" }).success).toBe(false)
        expect(setKpiTargetServerZodSchema.safeParse({ ...target, period: "week" }).success).toBe(false)
    })

    it("requires the period start the browser worked out", () => {
        expect(setKpiTargetServerZodSchema.safeParse({ ...target, period_start: "" }).success).toBe(false)
    })
})
