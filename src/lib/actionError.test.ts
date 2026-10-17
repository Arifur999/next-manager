import { describe, expect, it } from "vitest"
import { getActionErrorMessage, UNREACHABLE_MESSAGE } from "./actionError"
import { ApiRequestError } from "./apiFailure"

const FALLBACK = "Failed to save"

describe("getActionErrorMessage", () => {
    it("prefers the API's message", () => {
        const error = { isAxiosError: true, response: { status: 409, data: { message: "Name already taken" } } }
        expect(getActionErrorMessage(error, FALLBACK)).toBe("Name already taken")
    })

    it("takes the first of a string[] message", () => {
        const error = { isAxiosError: true, response: { status: 400, data: { message: ["Email is required", "x"] } } }
        expect(getActionErrorMessage(error, FALLBACK)).toBe("Email is required")
    })

    it("reports an unreachable server for an axios error without a response", () => {
        const error = { isAxiosError: true, code: "ECONNREFUSED", message: "connect ECONNREFUSED 10.0.0.5:5000" }
        expect(getActionErrorMessage(error, FALLBACK)).toBe(UNREACHABLE_MESSAGE)
    })

    it("reports an unreachable server for a failed fetch", () => {
        expect(getActionErrorMessage(new TypeError("fetch failed"), FALLBACK)).toBe(UNREACHABLE_MESSAGE)
    })

    it("falls back on a JSON parse error", () => {
        expect(getActionErrorMessage(new SyntaxError("Unexpected token <"), FALLBACK)).toBe(FALLBACK)
    })

    it("never returns raw Error text", () => {
        expect(getActionErrorMessage(new Error("ECONNREFUSED 10.0.0.5"), FALLBACK)).toBe(FALLBACK)
    })

    it("falls back when the API response has no message", () => {
        const error = { isAxiosError: true, response: { status: 502, data: "<html>" } }
        expect(getActionErrorMessage(error, FALLBACK)).toBe(FALLBACK)
    })
})

describe("getActionErrorMessage with the error httpClient throws", () => {
    it("prefers the API's message", () => {
        const error = new ApiRequestError("POST /clients", { status: 409, apiMessage: "Name already taken" })
        expect(getActionErrorMessage(error, FALLBACK)).toBe("Name already taken")
    })

    it("reports an unreachable server when there was no response", () => {
        const error = new ApiRequestError("GET /clients", { code: "ECONNRESET" })
        expect(getActionErrorMessage(error, FALLBACK)).toBe(UNREACHABLE_MESSAGE)
    })

    it("falls back when the API sent no message", () => {
        const error = new ApiRequestError("GET /clients", { status: 502 })
        expect(getActionErrorMessage(error, FALLBACK)).toBe(FALLBACK)
    })
})
