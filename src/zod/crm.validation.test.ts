import { describe, expect, it } from "vitest"
import { clientServerZodSchema } from "./crm.validation"

const validClient = {
    name: "Acme Corp",
    company: "Acme",
    email: "billing@acme.test",
    phone: "",
    country: "US",
    status: "active",
    notes: "",
}

describe("clientServerZodSchema", () => {
    it("builds the API payload from the form values", () => {
        expect(clientServerZodSchema.parse(validClient)).toEqual(validClient)
    })

    it("drops keys the client form does not own", () => {
        expect(clientServerZodSchema.parse({ ...validClient, id: "c1", created_at: "2026-01-01" })).toEqual(validClient)
    })

    it("rejects a blank name", () => {
        const result = clientServerZodSchema.safeParse({ ...validClient, name: "" })
        expect(result.error?.issues[0]?.message).toBe("Name is required")
    })

    it("accepts a blank email and rejects a malformed one", () => {
        expect(clientServerZodSchema.safeParse({ ...validClient, email: "" }).success).toBe(true)
        expect(clientServerZodSchema.safeParse({ ...validClient, email: "not-an-email" }).success).toBe(false)
    })

    it("rejects a status the API does not know", () => {
        expect(clientServerZodSchema.safeParse({ ...validClient, status: "deleted" }).success).toBe(false)
    })
})
