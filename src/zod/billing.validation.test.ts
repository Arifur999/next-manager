import { describe, expect, it } from "vitest"
import { createInvoiceServerZodSchema } from "./billing.validation"

describe("createInvoiceServerZodSchema", () => {
    const valid = {
        client_id: "c1",
        project_id: "",
        issue_date: "2026-10-12",
        due_date: "2026-10-26",
        discount: "",
        tax: "15",
        notes: "",
        items: [
            { description: "Design", quantity: "2", unit_price: "450.50" },
            { description: "Hosting", quantity: "1", unit_price: "20" },
        ],
    }

    it("builds the API payload with numbered, numeric lines and no total", () => {
        expect(createInvoiceServerZodSchema.parse(valid)).toEqual({
            client_id: "c1",
            project_id: null,
            issue_date: "2026-10-12",
            due_date: "2026-10-26",
            discount: 0,
            tax: 15,
            notes: "",
            status: "sent",
            items: [
                { description: "Design", quantity: 2, unit_price: 450.5, sort_order: 0 },
                { description: "Hosting", quantity: 1, unit_price: 20, sort_order: 1 },
            ],
        })
    })

    it("bills one unit for a blank quantity and nothing for a blank price", () => {
        const payload = createInvoiceServerZodSchema.parse({
            ...valid,
            items: [{ description: "Retainer", quantity: "", unit_price: "" }],
        })
        expect(payload.items).toEqual([{ description: "Retainer", quantity: 1, unit_price: 0, sort_order: 0 }])
    })

    it("keeps a chosen project", () => {
        expect(createInvoiceServerZodSchema.parse({ ...valid, project_id: "p1" }).project_id).toBe("p1")
    })

    it("rejects a line without a description", () => {
        const items = [{ description: "", quantity: "1", unit_price: "10" }]
        expect(createInvoiceServerZodSchema.safeParse({ ...valid, items }).error?.issues[0]?.message).toBe(
            "Describe the line",
        )
    })

    it("rejects an invoice with no lines", () => {
        expect(createInvoiceServerZodSchema.safeParse({ ...valid, items: [] }).error?.issues[0]?.message).toBe(
            "Add at least one line",
        )
    })

    it("rejects a negative discount", () => {
        expect(createInvoiceServerZodSchema.safeParse({ ...valid, discount: "-5" }).error?.issues[0]?.message).toBe(
            "Discount must be a number that is not negative",
        )
    })

    it("requires a client", () => {
        expect(createInvoiceServerZodSchema.safeParse({ ...valid, client_id: "" }).success).toBe(false)
    })
})
