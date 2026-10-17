import { describe, expect, it } from "vitest"
import {
    createAccountServerZodSchema,
    createDistributionServerZodSchema,
    createExchangeServerZodSchema,
    createLoanServerZodSchema,
    createShareholderServerZodSchema,
    payInstalmentServerZodSchema,
    setDefaultRateServerZodSchema,
} from "./finance.validation"

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

describe("createExchangeServerZodSchema", () => {
    const valid = {
        date: "2026-10-12",
        from_account_id: "usd-1",
        to_account_id: "bdt-1",
        amount_usd: "500",
        rate: "117.40",
        fee_usd: "12.50",
        notes: "",
    }

    it("builds the API payload with numeric amount, rate and fee", () => {
        expect(createExchangeServerZodSchema.parse(valid)).toEqual({
            date: "2026-10-12",
            from_account_id: "usd-1",
            to_account_id: "bdt-1",
            amount_usd: 500,
            rate: 117.4,
            fee_usd: 12.5,
            notes: "",
        })
    })

    it("sends a zero fee when the fee is blank", () => {
        expect(createExchangeServerZodSchema.parse({ ...valid, fee_usd: "" }).fee_usd).toBe(0)
    })

    it("requires the rate the processor actually paid", () => {
        expect(createExchangeServerZodSchema.safeParse({ ...valid, rate: "" }).error?.issues[0]?.message).toBe(
            "Rate is required",
        )
    })

    it("rejects a fee as large as the amount", () => {
        const result = createExchangeServerZodSchema.safeParse({ ...valid, fee_usd: "500" })
        expect(result.error?.issues[0]).toMatchObject({
            message: "The fee cannot be equal to or larger than the amount",
            path: ["fee_usd"],
        })
    })

    it("requires both accounts", () => {
        const result = createExchangeServerZodSchema.safeParse({ ...valid, from_account_id: "", to_account_id: "" })
        expect(result.error?.issues.map((issue) => issue.message)).toEqual([
            "Choose the USD account",
            "Choose the BDT account",
        ])
    })
})

describe("createLoanServerZodSchema", () => {
    const loan = {
        lender: "  City Bank ",
        principal_bdt: "500000",
        interest_rate: "",
        started_on: "2026-01-01",
        term_months: "12",
        account_id: "",
    }

    it("builds the API payload, with no account for a loan entered after the fact", () => {
        expect(createLoanServerZodSchema.parse(loan)).toEqual({
            lender: "City Bank",
            principal_bdt: 500000,
            interest_rate: 0,
            started_on: "2026-01-01",
            term_months: 12,
            account_id: undefined,
        })
    })

    it("keeps the account the money landed in and a typed rate", () => {
        const payload = createLoanServerZodSchema.parse({ ...loan, account_id: "bdt-1", interest_rate: "9.5" })
        expect(payload).toMatchObject({ account_id: "bdt-1", interest_rate: 9.5 })
    })

    it("says who lent it when the lender is blank", () => {
        expect(createLoanServerZodSchema.safeParse({ ...loan, lender: "   " }).error?.issues[0]?.message).toBe(
            "Say who lent it",
        )
    })

    it("rejects a term that is not a whole number of months", () => {
        for (const term_months of ["", "0", "1.5", "601"]) {
            expect(createLoanServerZodSchema.safeParse({ ...loan, term_months }).error?.issues[0]?.message).toBe(
                "Months must be a whole number from 1 to 600",
            )
        }
    })

    it("rejects a loan of nothing", () => {
        expect(createLoanServerZodSchema.safeParse({ ...loan, principal_bdt: "0" }).success).toBe(false)
    })
})

describe("payInstalmentServerZodSchema", () => {
    it("requires the account the instalment is paid from", () => {
        expect(payInstalmentServerZodSchema.parse({ account_id: "bdt-1" })).toEqual({ account_id: "bdt-1" })
        expect(payInstalmentServerZodSchema.safeParse({ account_id: "" }).success).toBe(false)
    })
})

describe("createShareholderServerZodSchema", () => {
    it("trims the name and gives a blank share as 0%", () => {
        expect(createShareholderServerZodSchema.parse({ name: " Arif ", share_pct: "" })).toEqual({
            name: "Arif",
            share_pct: 0,
        })
    })

    it("keeps a fractional share", () => {
        expect(createShareholderServerZodSchema.parse({ name: "Arif", share_pct: "12.5" }).share_pct).toBe(12.5)
    })

    it("rejects more than all of it", () => {
        const result = createShareholderServerZodSchema.safeParse({ name: "Arif", share_pct: "101" })
        expect(result.error?.issues[0]?.message).toBe("Nobody owns more than all of it")
    })

    it("requires a name", () => {
        expect(createShareholderServerZodSchema.safeParse({ name: "", share_pct: "10" }).success).toBe(false)
    })
})

describe("createDistributionServerZodSchema", () => {
    const distribution = { shareholder_id: "s1", date: "2026-10-12", amount_bdt: "75000", account_id: "bdt-1" }

    it("builds the API payload with a numeric amount", () => {
        expect(createDistributionServerZodSchema.parse(distribution)).toEqual({
            shareholder_id: "s1",
            date: "2026-10-12",
            amount_bdt: 75000,
            account_id: "bdt-1",
        })
    })

    it("requires who it is paid to and the account it comes from", () => {
        const result = createDistributionServerZodSchema.safeParse({ ...distribution, shareholder_id: "", account_id: "" })
        expect(result.error?.issues.map((issue) => issue.message)).toEqual([
            "Choose who it is paid to",
            "Choose the account it is paid from",
        ])
    })

    it("rejects a distribution of nothing", () => {
        expect(createDistributionServerZodSchema.safeParse({ ...distribution, amount_bdt: "0" }).success).toBe(false)
    })
})

describe("setDefaultRateServerZodSchema", () => {
    it("sends a typed rate as a number", () => {
        expect(setDefaultRateServerZodSchema.parse({ default_usd_rate: " 119.50 " })).toEqual({ default_usd_rate: 119.5 })
    })

    it("clears the rate when the box is left empty", () => {
        expect(setDefaultRateServerZodSchema.parse({ default_usd_rate: "" })).toEqual({ default_usd_rate: null })
    })

    it("refuses something that is not a number", () => {
        expect(setDefaultRateServerZodSchema.safeParse({ default_usd_rate: "abc" }).error?.issues[0]?.message).toBe(
            "That is not a number",
        )
    })
})
