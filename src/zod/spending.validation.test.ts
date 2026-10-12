import { describe, expect, it } from "vitest"
import { createExpenseCategoryServerZodSchema, createExpenseServerZodSchema } from "./spending.validation"

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
