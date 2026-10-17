import { describe, expect, it } from "vitest"
import {
    createExpenseCategoryServerZodSchema,
    createExpenseServerZodSchema,
    createOwnerWithdrawalServerZodSchema,
    createTeamPayoutServerZodSchema,
} from "./spending.validation"

const valid = {
    date: "2026-10-12",
    category_id: "c1",
    amount_bdt: "1250.50",
    account_id: "a1",
    project_id: "",
    vendor: "Landlord",
    notes: "",
}

describe("createExpenseServerZodSchema", () => {
    it("accepts a valid BDT amount and builds the API payload", () => {
        expect(createExpenseServerZodSchema.parse(valid)).toEqual({
            date: "2026-10-12",
            category_id: "c1",
            amount_bdt: 1250.5,
            account_id: "a1",
            project_id: null,
            vendor: "Landlord",
            notes: "",
        })
    })

    it("keeps a chosen project", () => {
        expect(createExpenseServerZodSchema.parse({ ...valid, project_id: "p1" }).project_id).toBe("p1")
    })

    it("rejects a zero amount", () => {
        expect(createExpenseServerZodSchema.safeParse({ ...valid, amount_bdt: "0" }).success).toBe(false)
    })

    it("rejects a non-numeric amount", () => {
        expect(createExpenseServerZodSchema.safeParse({ ...valid, amount_bdt: "abc" }).success).toBe(false)
    })

    it("requires a category and an account", () => {
        const result = createExpenseServerZodSchema.safeParse({ ...valid, category_id: "", account_id: "" })
        expect(result.success).toBe(false)
    })
})

describe("createExpenseCategoryServerZodSchema", () => {
    it("drops a blank budget", () => {
        expect(createExpenseCategoryServerZodSchema.parse({ name: "Rent", type: "general", monthly_budget: "" })).toEqual({
            name: "Rent",
            type: "general",
            monthly_budget: undefined,
        })
    })
})

describe("createTeamPayoutServerZodSchema", () => {
    const payout = {
        user_id: "u1",
        project_id: "",
        date: "2026-10-12",
        amount_bdt: "45000",
        type: "salary",
        account_id: "bdt-1",
        notes: "",
    }

    it("builds the API payload, with no project for a general salary", () => {
        expect(createTeamPayoutServerZodSchema.parse(payout)).toEqual({
            user_id: "u1",
            project_id: null,
            date: "2026-10-12",
            amount_bdt: 45000,
            type: "salary",
            account_id: "bdt-1",
            notes: "",
        })
    })

    it("ties a payout to a chosen project", () => {
        expect(createTeamPayoutServerZodSchema.parse({ ...payout, project_id: "p1" }).project_id).toBe("p1")
    })

    it("rejects a payout type the API does not know", () => {
        expect(createTeamPayoutServerZodSchema.safeParse({ ...payout, type: "gift" }).success).toBe(false)
    })

    it("requires a team member and a BDT account", () => {
        const result = createTeamPayoutServerZodSchema.safeParse({ ...payout, user_id: "", account_id: "" })
        expect(result.error?.issues.map((issue) => issue.message)).toEqual([
            "Choose a team member",
            "Choose a BDT account",
        ])
    })
})

describe("createOwnerWithdrawalServerZodSchema", () => {
    const withdrawal = { date: "2026-10-12", amount_bdt: "20000", type: "personal", account_id: "bdt-1", notes: "" }

    it("builds the API payload with a numeric amount", () => {
        expect(createOwnerWithdrawalServerZodSchema.parse(withdrawal)).toEqual({
            date: "2026-10-12",
            amount_bdt: 20000,
            type: "personal",
            account_id: "bdt-1",
            notes: "",
        })
    })

    it("accepts money put back into the business", () => {
        expect(createOwnerWithdrawalServerZodSchema.parse({ ...withdrawal, type: "reinvestment" }).type).toBe("reinvestment")
    })

    it("rejects a negative amount", () => {
        expect(createOwnerWithdrawalServerZodSchema.safeParse({ ...withdrawal, amount_bdt: "-1" }).success).toBe(false)
    })

    it("requires a BDT account", () => {
        expect(
            createOwnerWithdrawalServerZodSchema.safeParse({ ...withdrawal, account_id: "" }).error?.issues[0]?.message,
        ).toBe("Choose a BDT account")
    })
})
