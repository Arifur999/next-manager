import { describe, expect, it } from "vitest"
import { z } from "zod"
import { classifyLinkLookup } from "./linkLookup"

const schema = z.object({ email: z.string() })

describe("classifyLinkLookup", () => {
    it("returns the parsed data for a live link", () => {
        expect(classifyLinkLookup(200, { success: true, data: { email: "rina@northwind.com" } }, schema)).toEqual({
            status: "valid",
            data: { email: "rina@northwind.com" },
        })
    })

    it.each([404, 410])("calls a %i a dead link", (status) => {
        expect(classifyLinkLookup(status, { success: false, message: "No longer valid" }, schema)).toEqual({
            status: "gone",
        })
    })

    it.each([400, 429, 500, 502, 503])("never calls a %i a dead link", (status) => {
        expect(classifyLinkLookup(status, null, schema)).toEqual({ status: "unavailable" })
    })

    it("treats a success it cannot read as a check that did not go through", () => {
        expect(classifyLinkLookup(200, { success: true, data: { name: "x" } }, schema)).toEqual({
            status: "unavailable",
        })
        expect(classifyLinkLookup(200, null, schema)).toEqual({ status: "unavailable" })
    })
})
