import { describe, expect, it } from "vitest"
import {
    activeStateServerZodSchema,
    capacityServerZodSchema,
    completePayrollServerZodSchema,
    createInviteServerZodSchema,
    createPayrollRunServerZodSchema,
    departmentServerZodSchema,
    leaveTypeServerZodSchema,
    setPayrollItemsServerZodSchema,
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

describe("createPayrollRunServerZodSchema", () => {
    it("turns the month picked into its first and last day", () => {
        expect(createPayrollRunServerZodSchema.parse({ month: "2026-10" })).toEqual({
            period_start: "2026-10-01",
            period_end: "2026-10-31",
        })
    })

    it("ends February on the 29th in a leap year", () => {
        expect(createPayrollRunServerZodSchema.parse({ month: "2028-02" }).period_end).toBe("2028-02-29")
    })

    it.each(["", "2026-13", "2026-1"])("rejects %j as a month", (month) => {
        expect(createPayrollRunServerZodSchema.safeParse({ month }).error?.issues[0]?.message).toBe("Pick a month")
    })
})

describe("setPayrollItemsServerZodSchema", () => {
    it("sends each line's figures as numbers", () => {
        expect(
            setPayrollItemsServerZodSchema.parse({ items: [{ id: "i1", gross_bdt: "30000", deductions_bdt: "500" }] }),
        ).toEqual({ items: [{ id: "i1", gross_bdt: 30000, deductions_bdt: 500 }] })
    })

    it("sends a blank box as zero", () => {
        expect(setPayrollItemsServerZodSchema.parse({ items: [{ id: "i1", gross_bdt: "", deductions_bdt: "" }] })).toEqual({
            items: [{ id: "i1", gross_bdt: 0, deductions_bdt: 0 }],
        })
    })

    it("rejects a negative wage", () => {
        const result = setPayrollItemsServerZodSchema.safeParse({ items: [{ id: "i1", gross_bdt: "-1", deductions_bdt: "" }] })
        expect(result.success).toBe(false)
    })

    it("rejects a save with no lines", () => {
        expect(setPayrollItemsServerZodSchema.safeParse({ items: [] }).error?.issues[0]?.message).toBe("Nothing to save")
    })
})

describe("completePayrollServerZodSchema", () => {
    it("sends the account the salaries are paid from", () => {
        expect(completePayrollServerZodSchema.parse({ account_id: "a1" })).toEqual({ account_id: "a1" })
    })

    it("refuses to pay without an account", () => {
        const result = completePayrollServerZodSchema.safeParse({ account_id: "" })
        expect(result.error?.issues[0]?.message).toBe("Choose the account the salaries are paid from")
    })
})

describe("createInviteServerZodSchema", () => {
    it("sends the address trimmed", () => {
        expect(createInviteServerZodSchema.parse({ email: " colleague@example.com " })).toEqual({
            email: "colleague@example.com",
        })
    })

    it.each(["", "colleague@"])("refuses %j as an address", (email) => {
        const result = createInviteServerZodSchema.safeParse({ email })
        expect(result.error?.issues[0]?.message).toBe("Enter a valid email address")
    })
})

describe("capacityServerZodSchema", () => {
    it("sends the hours and rate as numbers", () => {
        expect(capacityServerZodSchema.parse({ weekly_hours: "32.5", standard_rate_usd: "45" })).toEqual({
            weekly_hours: 32.5,
            standard_rate_usd: 45,
        })
    })

    it("leaves a blank rate out", () => {
        expect(capacityServerZodSchema.parse({ weekly_hours: "40", standard_rate_usd: "" }).standard_rate_usd).toBeUndefined()
    })

    it("refuses a week of no hours", () => {
        const result = capacityServerZodSchema.safeParse({ weekly_hours: "0", standard_rate_usd: "" })
        expect(result.error?.issues[0]?.message).toBe("Weekly hours must be greater than zero")
    })

    it("refuses a negative rate", () => {
        expect(capacityServerZodSchema.safeParse({ weekly_hours: "40", standard_rate_usd: "-5" }).success).toBe(false)
    })
})
