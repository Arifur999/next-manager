import { describe, expect, it } from "vitest"
import {
    capacityServerZodSchema,
    completePayrollServerZodSchema,
    createInviteServerZodSchema,
    createPayrollRunServerZodSchema,
    departmentServerZodSchema,
    leaveDecisionServerZodSchema,
    leaveTypeServerZodSchema,
    recordAttendanceServerZodSchema,
    requestLeaveServerZodSchema,
    setPayrollItemsServerZodSchema,
    suggestedLeaveDays,
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

describe("leaveTypeServerZodSchema", () => {
    const valid = { name: " Study leave ", days_per_year: "10", is_paid: false }

    it("builds the API payload with a whole number of days", () => {
        expect(leaveTypeServerZodSchema.parse(valid)).toEqual({ name: "Study leave", days_per_year: 10, is_paid: false })
    })

    it("sends blank days as zero, which means uncapped", () => {
        expect(leaveTypeServerZodSchema.parse({ ...valid, days_per_year: "" }).days_per_year).toBe(0)
    })

    it.each(["1.5", "-1", "366", "ten"])("rejects an allowance of %s days", (days_per_year) => {
        expect(leaveTypeServerZodSchema.safeParse({ ...valid, days_per_year }).success).toBe(false)
    })

    it("accepts any whole number the number box allows", () => {
        expect(leaveTypeServerZodSchema.parse({ ...valid, days_per_year: "1e2" }).days_per_year).toBe(100)
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

    it("sends a cleared rate as zero, which unsets it", () => {
        expect(capacityServerZodSchema.parse({ weekly_hours: "40", standard_rate_usd: "" }).standard_rate_usd).toBe(0)
    })

    it("refuses a week of no hours", () => {
        const result = capacityServerZodSchema.safeParse({ weekly_hours: "0", standard_rate_usd: "" })
        expect(result.error?.issues[0]?.message).toBe("Weekly hours must be greater than zero")
    })

    it("refuses a negative rate", () => {
        expect(capacityServerZodSchema.safeParse({ weekly_hours: "40", standard_rate_usd: "-5" }).success).toBe(false)
    })
})

describe("recordAttendanceServerZodSchema", () => {
    const day = { user_id: "u1", date: "2026-10-12", check_in: "09:15", check_out: "17:40" }

    it("sends both times as HH:MM", () => {
        expect(recordAttendanceServerZodSchema.parse(day)).toEqual(day)
    })

    it("leaves a blank time out, so it stays not recorded", () => {
        const payload = recordAttendanceServerZodSchema.parse({ ...day, check_out: "" })
        expect(payload).toEqual({ user_id: "u1", date: "2026-10-12", check_in: "09:15", check_out: undefined })
    })

    it.each(["25:00", "9:15"])("refuses %s as a check-in", (check_in) => {
        const result = recordAttendanceServerZodSchema.safeParse({ ...day, check_in })
        expect(result.error?.issues[0]?.message).toBe("Check-in must be HH:MM")
    })

    it("requires somebody to record it for", () => {
        const result = recordAttendanceServerZodSchema.safeParse({ ...day, user_id: "" })
        expect(result.error?.issues[0]?.message).toBe("Choose somebody")
    })
})

describe("suggestedLeaveDays", () => {
    it("counts both the first and the last day", () => {
        expect(suggestedLeaveDays("2026-10-12", "2026-10-14")).toBe(3)
    })

    it("never suggests less than a day", () => {
        expect(suggestedLeaveDays("2026-10-14", "2026-10-12")).toBe(1)
        expect(suggestedLeaveDays("", "")).toBe(1)
    })
})

describe("requestLeaveServerZodSchema", () => {
    const request = {
        leave_type_id: "t1",
        from_date: "2026-10-12",
        to_date: "2026-10-14",
        days: "2.5",
        reason: " Family visit ",
    }

    it("sends the days typed and the reason trimmed", () => {
        expect(requestLeaveServerZodSchema.parse(request)).toEqual({
            leave_type_id: "t1",
            from_date: "2026-10-12",
            to_date: "2026-10-14",
            days: 2.5,
            reason: "Family visit",
        })
    })

    it("counts the days from the dates when the box is blank", () => {
        expect(requestLeaveServerZodSchema.parse({ ...request, days: "" }).days).toBe(3)
    })

    it("refuses leave of zero days", () => {
        const result = requestLeaveServerZodSchema.safeParse({ ...request, days: "0" })
        expect(result.error?.issues[0]?.message).toBe("Days must be a number greater than zero")
    })

    it("requires a kind of leave", () => {
        const result = requestLeaveServerZodSchema.safeParse({ ...request, leave_type_id: "" })
        expect(result.error?.issues[0]?.message).toBe("Choose a kind")
    })
})

describe("leaveDecisionServerZodSchema", () => {
    it("accepts a yes or a no", () => {
        expect(leaveDecisionServerZodSchema.parse({ approve: false })).toEqual({ approve: false })
    })

    it("refuses an answer that is not a boolean", () => {
        expect(leaveDecisionServerZodSchema.safeParse({ approve: "yes" }).success).toBe(false)
    })

    it("sends a trimmed reason with a turn-down, and none when it is blank", () => {
        expect(leaveDecisionServerZodSchema.parse({ approve: false, note: "  Launch week " })).toEqual({
            approve: false,
            note: "Launch week",
        })
        expect(leaveDecisionServerZodSchema.parse({ approve: false, note: "   " }).note).toBeUndefined()
    })

    it("refuses a reason longer than the API keeps", () => {
        const result = leaveDecisionServerZodSchema.safeParse({ approve: false, note: "x".repeat(301) })
        expect(result.error?.issues[0]?.message).toBe("Keep the reason under 300 characters")
    })
})
