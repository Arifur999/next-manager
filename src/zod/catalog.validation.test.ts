import { describe, expect, it } from "vitest"
import {
    NO_CATEGORY,
    serviceCategoryServerZodSchema,
    serviceServerZodSchema,
    serviceTemplateServerZodSchema,
} from "./catalog.validation"

describe("serviceServerZodSchema", () => {
    const valid = { name: " Logo design ", description: " Three concepts ", category_id: "c1", default_price_usd: "250" }

    it("trims the text and sends the price as a number", () => {
        expect(serviceServerZodSchema.parse(valid)).toEqual({
            name: "Logo design",
            description: "Three concepts",
            category_id: "c1",
            default_price_usd: 250,
        })
    })

    it("sends ungrouped as a null category", () => {
        expect(serviceServerZodSchema.parse({ ...valid, category_id: NO_CATEGORY }).category_id).toBeNull()
    })

    it("sends a blank price as zero, which means priced each time", () => {
        expect(serviceServerZodSchema.parse({ ...valid, default_price_usd: "" }).default_price_usd).toBe(0)
    })

    it("refuses a negative price", () => {
        expect(serviceServerZodSchema.safeParse({ ...valid, default_price_usd: "-1" }).success).toBe(false)
    })

    it("refuses a blank name", () => {
        const result = serviceServerZodSchema.safeParse({ ...valid, name: "  " })
        expect(result.error?.issues[0]?.message).toBe("Give it a name")
    })
})

describe("serviceCategoryServerZodSchema", () => {
    it("trims the name", () => {
        expect(serviceCategoryServerZodSchema.parse({ name: " Design " })).toEqual({ name: "Design" })
    })

    it("refuses a blank name", () => {
        expect(serviceCategoryServerZodSchema.safeParse({ name: "" }).success).toBe(false)
    })
})

describe("serviceTemplateServerZodSchema", () => {
    it("turns the picked services into lines", () => {
        expect(serviceTemplateServerZodSchema.parse({ name: " Launch ", quantities: { s1: 1, s2: 3 } })).toEqual({
            name: "Launch",
            items: [
                { service_id: "s1", quantity: 1 },
                { service_id: "s2", quantity: 3 },
            ],
        })
    })

    it("refuses a package with nothing in it", () => {
        const result = serviceTemplateServerZodSchema.safeParse({ name: "Launch", quantities: {} })
        expect(result.error?.issues[0]?.message).toBe("Pick at least one service")
    })

    it("refuses a line of zero", () => {
        expect(serviceTemplateServerZodSchema.safeParse({ name: "Launch", quantities: { s1: 0 } }).success).toBe(false)
    })
})
