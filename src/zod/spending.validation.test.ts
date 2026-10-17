import { describe, expect, it } from "vitest"
import {
    createDuePersonServerZodSchema,
    createDueTransactionServerZodSchema,
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
            receipt_url: "",
        })
    })

    it("keeps a receipt link, trimmed", () => {
        const payload = createExpenseServerZodSchema.parse({ ...valid, receipt_url: " https://drive.example.test/r/1 " })
        expect(payload.receipt_url).toBe("https://drive.example.test/r/1")
    })

    it("refuses a receipt link that is not a web address", () => {
        const result = createExpenseServerZodSchema.safeParse({ ...valid, receipt_url: "javascript:alert(1)" })
        expect(result.error?.issues[0]?.message).toBe("Enter a full link, starting with https://")
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
    it("trims the name, and refuses one that is only spaces", () => {
        expect(createExpenseCategoryServerZodSchema.parse({ name: " Rent ", type: "general" }).name).toBe("Rent")
        expect(createExpenseCategoryServerZodSchema.safeParse({ name: "  ", type: "general" }).success).toBe(false)
    })

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

describe("createDuePersonServerZodSchema", () => {
    it("passes a name and a phone through", () => {
        expect(createDuePersonServerZodSchema.parse({ name: "Karim", phone: "01700000000" })).toEqual({
            name: "Karim",
            phone: "01700000000",
        })
    })

    it("requires a name", () => {
        expect(createDuePersonServerZodSchema.safeParse({ name: "", phone: "" }).error?.issues[0]?.message).toBe(
            "Name is required",
        )
    })
})

describe("createDueTransactionServerZodSchema", () => {
    const transaction = {
        due_person_id: "d1",
        date: "2026-10-12",
        direction: "received",
        amount_bdt: "5000",
        account_id: "bdt-1",
        notes: "",
    }

    it("builds the API payload with a numeric amount", () => {
        expect(createDueTransactionServerZodSchema.parse(transaction)).toEqual({
            due_person_id: "d1",
            date: "2026-10-12",
            direction: "received",
            amount_bdt: 5000,
            account_id: "bdt-1",
            notes: "",
        })
    })

    it("rejects a direction other than received or payment", () => {
        expect(createDueTransactionServerZodSchema.safeParse({ ...transaction, direction: "loan" }).success).toBe(false)
    })

    it("requires a person", () => {
        expect(
            createDueTransactionServerZodSchema.safeParse({ ...transaction, due_person_id: "" }).error?.issues[0]?.message,
        ).toBe("Choose a person")
    })

    it("rejects a zero amount", () => {
        expect(createDueTransactionServerZodSchema.safeParse({ ...transaction, amount_bdt: "0" }).success).toBe(false)
    })
})
