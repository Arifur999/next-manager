import { describe, expect, it } from "vitest"
import {
    createCompanyServerZodSchema,
    createPlanServerZodSchema,
    setSubscriptionServerZodSchema,
    updatePlanServerZodSchema,
} from "./platform.validation"

describe("createPlanServerZodSchema", () => {
    it("normalises the code and builds the API payload", () => {
        expect(createPlanServerZodSchema.parse({ code: " Agency_Pro ", name: " Agency Pro ", price_usd: "49" })).toEqual({
            code: "agency_pro",
            name: "Agency Pro",
            price_usd: 49,
        })
    })

    it("makes an empty price a free plan", () => {
        expect(createPlanServerZodSchema.parse({ code: "free", name: "Free", price_usd: "" }).price_usd).toBe(0)
    })

    it("rejects a code with anything but letters, numbers and underscores", () => {
        const result = createPlanServerZodSchema.safeParse({ code: "agency-pro", name: "Agency Pro", price_usd: "" })
        expect(result.error?.issues[0]?.message).toBe("Code must be lowercase letters, numbers and underscores")
    })

    it("requires a code and a name", () => {
        expect(createPlanServerZodSchema.safeParse({ code: " ", name: "Pro", price_usd: "" }).success).toBe(false)
        expect(createPlanServerZodSchema.safeParse({ code: "pro", name: " ", price_usd: "" }).success).toBe(false)
    })

    it("rejects a negative price", () => {
        expect(createPlanServerZodSchema.safeParse({ code: "pro", name: "Pro", price_usd: "-1" }).success).toBe(false)
    })
})

describe("updatePlanServerZodSchema", () => {
    it("turns empty limits into unlimited", () => {
        expect(updatePlanServerZodSchema.parse({ price_usd: "29.5", max_seats: "", max_projects: " " })).toEqual({
            price_usd: 29.5,
            max_seats: null,
            max_projects: null,
        })
    })

    it("keeps whole-number limits", () => {
        expect(updatePlanServerZodSchema.parse({ price_usd: "0", max_seats: "5", max_projects: "12" })).toEqual({
            price_usd: 0,
            max_seats: 5,
            max_projects: 12,
        })
    })

    it("rejects a zero or fractional limit", () => {
        expect(updatePlanServerZodSchema.safeParse({ price_usd: "1", max_seats: "0", max_projects: "" }).success).toBe(false)
        expect(updatePlanServerZodSchema.safeParse({ price_usd: "1", max_seats: "", max_projects: "1.5" }).success).toBe(
            false,
        )
    })
})

describe("setSubscriptionServerZodSchema", () => {
    it("accepts a plan and a known status", () => {
        expect(setSubscriptionServerZodSchema.parse({ plan_id: "p1", status: "past_due" })).toEqual({
            plan_id: "p1",
            status: "past_due",
        })
    })

    it("requires a plan and refuses an unknown status", () => {
        expect(setSubscriptionServerZodSchema.safeParse({ plan_id: "", status: "active" }).success).toBe(false)
        expect(setSubscriptionServerZodSchema.safeParse({ plan_id: "p1", status: "paused" }).success).toBe(false)
    })
})

describe("createCompanyServerZodSchema", () => {
    const valid = {
        name: " Bright Pixel ",
        admin_name: " Rina Das ",
        admin_email: " rina@brightpixel.com ",
        admin_password: "welcome12",
        plan_id: "p1",
        trial_days: "14",
    }

    it("trims the names and email and builds the API payload", () => {
        expect(createCompanyServerZodSchema.parse(valid)).toEqual({
            name: "Bright Pixel",
            admin_name: "Rina Das",
            admin_email: "rina@brightpixel.com",
            admin_password: "welcome12",
            plan_id: "p1",
            trial_days: 14,
        })
    })

    it("leaves out an empty plan and an empty trial", () => {
        const payload = createCompanyServerZodSchema.parse({ ...valid, plan_id: "", trial_days: "" })
        expect(payload.plan_id).toBeUndefined()
        expect(payload.trial_days).toBeUndefined()
    })

    it("rejects a trial of zero days or more than a year", () => {
        expect(createCompanyServerZodSchema.safeParse({ ...valid, trial_days: "0" }).success).toBe(false)
        expect(createCompanyServerZodSchema.safeParse({ ...valid, trial_days: "366" }).success).toBe(false)
    })

    it("rejects a weak password and an invalid email", () => {
        expect(createCompanyServerZodSchema.safeParse({ ...valid, admin_password: "short" }).success).toBe(false)
        const badEmail = createCompanyServerZodSchema.safeParse({ ...valid, admin_email: "rina" })
        expect(badEmail.error?.issues[0]?.message).toBe("Enter a valid email address for the admin")
    })
})
