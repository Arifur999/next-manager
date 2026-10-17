import { describe, expect, it } from "vitest"
import { credentialFormZodSchema } from "./workspace.validation"

describe("credentialFormZodSchema", () => {
    const valid = { label: "Acme cPanel", password: "s3cret" }

    it("accepts a credential with no URL", () => {
        expect(credentialFormZodSchema.safeParse(valid).success).toBe(true)
        expect(credentialFormZodSchema.safeParse({ ...valid, url: "" }).success).toBe(true)
    })

    it("accepts only http and https links", () => {
        expect(credentialFormZodSchema.safeParse({ ...valid, url: "https://acme.example" }).success).toBe(true)
        const script = credentialFormZodSchema.safeParse({ ...valid, url: "javascript:alert(1)" })
        expect(script.error?.issues[0]?.message).toBe("Enter a full URL, including https://")
    })

    it("requires a label and a password", () => {
        expect(credentialFormZodSchema.safeParse({ ...valid, label: "" }).success).toBe(false)
        expect(credentialFormZodSchema.safeParse({ ...valid, password: "" }).success).toBe(false)
    })
})
