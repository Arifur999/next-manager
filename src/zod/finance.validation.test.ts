import { describe, expect, it } from "vitest"
import { createAccountServerZodSchema } from "./finance.validation"

describe("createAccountServerZodSchema", () => {
    const valid = { name: "PayPal main", type: "paypal", currency: "USD", opening_balance: "1500.50", notes: "" }

    it("builds the API payload with a numeric opening balance", () => {
        expect(createAccountServerZodSchema.parse(valid)).toEqual({
            name: "PayPal main",
            type: "paypal",
            currency: "USD",
            opening_balance: 1500.5,
            notes: "",
        })
    })

    it("opens an empty wallet when the opening balance is blank", () => {
        expect(createAccountServerZodSchema.parse({ ...valid, opening_balance: "" }).opening_balance).toBe(0)
    })

    it("requires a name", () => {
        expect(createAccountServerZodSchema.safeParse({ ...valid, name: "" }).error?.issues[0]?.message).toBe(
            "Name is required",
        )
    })

    it("rejects a negative opening balance", () => {
        expect(createAccountServerZodSchema.safeParse({ ...valid, opening_balance: "-10" }).success).toBe(false)
    })

    it("rejects a currency other than USD or BDT", () => {
        expect(createAccountServerZodSchema.safeParse({ ...valid, currency: "EUR" }).error?.issues[0]?.message).toBe(
            "Choose a currency",
        )
    })
})
