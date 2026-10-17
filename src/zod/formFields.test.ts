import { describe, expect, it } from "vitest"
import {
    activeStateServerZodSchema,
    isoDate,
    newPassword,
    optionalNonNegative,
    positiveAmount,
    requiredEmail,
    toNumber,
} from "./formFields"

describe("positiveAmount", () => {
    const amount = positiveAmount("Amount")

    it("accepts a decimal greater than zero", () => {
        expect(amount.parse("1250.50")).toBe("1250.50")
    })

    it("names the field in each rejection", () => {
        expect(amount.safeParse("").error?.issues[0]?.message).toBe("Amount is required")
        expect(amount.safeParse("abc").error?.issues[0]?.message).toBe("Amount must be a number")
        expect(amount.safeParse("0").error?.issues[0]?.message).toBe("Amount must be greater than zero")
        expect(amount.safeParse("-5").error?.issues[0]?.message).toBe("Amount must be greater than zero")
    })
})

describe("optionalNonNegative", () => {
    const fee = optionalNonNegative("Fee")

    it("treats blank and missing as not given, and allows zero", () => {
        expect(fee.safeParse(undefined).success).toBe(true)
        expect(fee.safeParse("").success).toBe(true)
        expect(fee.safeParse("0").success).toBe(true)
    })

    it("rejects a negative or non-numeric value", () => {
        expect(fee.safeParse("-1").error?.issues[0]?.message).toBe("Fee must be a number that is not negative")
        expect(fee.safeParse("ten").success).toBe(false)
    })
})

describe("isoDate", () => {
    it("accepts YYYY-MM-DD only", () => {
        expect(isoDate.safeParse("2026-10-17").success).toBe(true)
        expect(isoDate.safeParse("17/10/2026").error?.issues[0]?.message).toBe("Pick a date")
    })
})

describe("toNumber", () => {
    it("maps blank and missing to undefined and the rest to numbers", () => {
        expect(toNumber(undefined)).toBeUndefined()
        expect(toNumber("")).toBeUndefined()
        expect(toNumber("0")).toBe(0)
        expect(toNumber("12.5")).toBe(12.5)
    })
})

describe("activeStateServerZodSchema", () => {
    it("accepts a boolean", () => {
        expect(activeStateServerZodSchema.parse({ is_active: false })).toEqual({ is_active: false })
    })

    it("rejects a string that only looks like one", () => {
        expect(activeStateServerZodSchema.safeParse({ is_active: "false" }).success).toBe(false)
    })

    it("drops any other field", () => {
        expect(activeStateServerZodSchema.parse({ is_active: true, share_pct: 100 })).toEqual({ is_active: true })
    })
})

describe("newPassword", () => {
    it("accepts eight characters with a letter and a number", () => {
        expect(newPassword.safeParse("secret12").success).toBe(true)
    })

    it("names what is missing", () => {
        expect(newPassword.safeParse("s3cret").error?.issues[0]?.message).toBe("Password must be at least 8 characters")
        expect(newPassword.safeParse("12345678").error?.issues[0]?.message).toBe("Password must contain a letter")
        expect(newPassword.safeParse("password").error?.issues[0]?.message).toBe("Password must contain a number")
    })
})

describe("requiredEmail", () => {
    it("says an empty email is missing before calling it invalid", () => {
        expect(requiredEmail.safeParse("").error?.issues.map((issue) => issue.message)).toEqual(["Email is required"])
        expect(requiredEmail.safeParse("rina").error?.issues[0]?.message).toBe("Enter a valid email address")
        expect(requiredEmail.safeParse("rina@northwind.com").success).toBe(true)
    })
})
