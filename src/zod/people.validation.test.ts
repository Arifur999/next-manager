import { describe, expect, it } from "vitest"
import {
    activeStateServerZodSchema,
    departmentServerZodSchema,
    leaveTypeServerZodSchema,
} from "./people.validation"

describe("departmentServerZodSchema", () => {
    it("trims the name and description into the API payload", () => {
        expect(departmentServerZodSchema.parse({ name: " Design ", description: " Brand and UI " })).toEqual({
            name: "Design",
            description: "Brand and UI",
        })
    })

    it("keeps a blank description, so an edit can clear it", () => {
        expect(departmentServerZodSchema.parse({ name: "Design", description: "  " }).description).toBe("")
    })

    it("rejects a blank name", () => {
        const result = departmentServerZodSchema.safeParse({ name: "   ", description: "" })
        expect(result.error?.issues[0]?.message).toBe("Name is required")
    })

    it("rejects a name longer than a team name", () => {
        expect(departmentServerZodSchema.safeParse({ name: "x".repeat(61), description: "" }).success).toBe(false)
    })
})

describe("activeStateServerZodSchema", () => {
    it("accepts a boolean", () => {
        expect(activeStateServerZodSchema.parse({ is_active: false })).toEqual({ is_active: false })
    })

    it("rejects a string that only looks like one", () => {
        expect(activeStateServerZodSchema.safeParse({ is_active: "false" }).success).toBe(false)
    })
})

describe("leaveTypeServerZodSchema", () => {
    const valid = { name: " Study leave ", days_per_year: "10", is_paid: false }

    it("builds the API payload with a whole number of days", () => {
        expect(leaveTypeServerZodSchema.parse(valid)).toEqual({ name: "Study leave", days_per_year: 10, is_paid: false })
    })

    it("sends blank days as zero, which means uncapped", () => {
        expect(leaveTypeServerZodSchema.parse({ ...valid, days_per_year: "" }).days_per_year).toBe(0)
    })

    it.each(["1.5", "-1", "366"])("rejects an allowance of %s days", (days_per_year) => {
        expect(leaveTypeServerZodSchema.safeParse({ ...valid, days_per_year }).success).toBe(false)
    })

    it("rejects a blank name", () => {
        expect(leaveTypeServerZodSchema.safeParse({ ...valid, name: " " }).success).toBe(false)
    })
})
