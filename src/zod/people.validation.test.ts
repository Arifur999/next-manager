import { describe, expect, it } from "vitest"
import { activeStateServerZodSchema, departmentServerZodSchema } from "./people.validation"

describe("departmentServerZodSchema", () => {
    it("trims the name and description into the API payload", () => {
        expect(departmentServerZodSchema.parse({ name: " Design ", description: " Brand and UI " })).toEqual({
            name: "Design",
            description: "Brand and UI",
        })
    })

    it("keeps a blank description, so an edit can clear it", () => {
        expect(departmentServerZodSchema.parse({ name: "Design", description: "  " }).description).toBe("")
    })

    it("rejects a blank name", () => {
        const result = departmentServerZodSchema.safeParse({ name: "   ", description: "" })
        expect(result.error?.issues[0]?.message).toBe("Name is required")
    })

    it("rejects a name longer than a team name", () => {
        expect(departmentServerZodSchema.safeParse({ name: "x".repeat(61), description: "" }).success).toBe(false)
    })
})

describe("activeStateServerZodSchema", () => {
    it("accepts a boolean", () => {
        expect(activeStateServerZodSchema.parse({ is_active: false })).toEqual({ is_active: false })
    })

    it("rejects a string that only looks like one", () => {
        expect(activeStateServerZodSchema.safeParse({ is_active: "false" }).success).toBe(false)
    })
})
