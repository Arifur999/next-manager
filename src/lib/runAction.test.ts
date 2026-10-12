import { describe, expect, it, vi } from "vitest"
import { z } from "zod"
import { requireId, runAction, runValidatedAction } from "./runAction"

const schema = z.object({ amount: z.coerce.number().positive("Amount must be above zero") })

describe("runValidatedAction", () => {
    it("rejects bad input without calling the service", async () => {
        const service = vi.fn()
        const result = await runValidatedAction(schema, { amount: "0" }, "Failed", service)
        expect(service).not.toHaveBeenCalled()
        expect(result).toEqual({
            success: false,
            message: "Amount must be above zero",
            fieldErrors: { amount: ["Amount must be above zero"] },
        })
    })

    it("passes the parsed payload to the service", async () => {
        const service = vi.fn().mockResolvedValue({ success: true, message: "Saved", data: { id: "e1" } })
        const result = await runValidatedAction(schema, { amount: "12.5" }, "Failed", service)
        expect(service).toHaveBeenCalledWith({ amount: 12.5 })
        expect(result).toEqual({ success: true, message: "Saved", data: { id: "e1" }, meta: undefined })
    })

    it("maps an API error to its message", async () => {
        const error = { isAxiosError: true, response: { status: 409, data: { message: "Duplicate" } } }
        const service = vi.fn().mockRejectedValue(error)
        const result = await runValidatedAction(schema, { amount: 5 }, "Failed", service)
        expect(result).toEqual({ success: false, message: "Duplicate" })
    })
})

describe("runAction", () => {
    it("never returns raw error text", async () => {
        const result = await runAction("Failed to delete", () => Promise.reject(new Error("ECONNREFUSED 10.0.0.5")))
        expect(result).toEqual({ success: false, message: "Failed to delete" })
    })
})

describe("requireId", () => {
    it("refuses an empty id", () => {
        expect(requireId("", "expense")).toEqual({ success: false, message: "Invalid expense id" })
    })

    it("passes a real id through", () => {
        expect(requireId("e1", "expense")).toBeUndefined()
    })
})
