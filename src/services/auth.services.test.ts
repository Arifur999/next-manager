import { afterEach, describe, expect, it, vi } from "vitest"
import { checkResetLink } from "./auth.services"

vi.mock("server-only", () => ({}))
vi.mock("@/env", () => ({ getApiBaseUrl: () => "http://api.test/api/v1" }))
vi.mock("@/lib/axios/httpClient", () => ({ httpClient: {} }))
vi.mock("@/lib/logger", () => ({ logger: { warn: vi.fn(), error: vi.fn() }, errorFields: () => ({}) }))

const answer = (status: number, body: unknown) =>
    vi.fn(async () => Response.json(body, { status }))

describe("checkResetLink", () => {
    afterEach(() => {
        vi.unstubAllGlobals()
    })

    it("asks the API about the token, escaped into the path", async () => {
        const fetchMock = answer(200, { success: true, data: { valid: true } })
        vi.stubGlobal("fetch", fetchMock)

        expect(await checkResetLink("a/b c")).toEqual({ status: "valid", data: null })
        expect(fetchMock.mock.calls[0]?.at(0)).toBe("http://api.test/api/v1/auth/reset-password/a%2Fb%20c")
    })

    it("calls a link the API says is no longer valid dead", async () => {
        vi.stubGlobal("fetch", answer(200, { success: true, data: { valid: false } }))

        expect(await checkResetLink("spent")).toEqual({ status: "gone" })
    })

    it.each([404, 429, 500])("never calls a link dead on a %i", async (status) => {
        vi.stubGlobal("fetch", answer(status, { success: false, message: "No" }))

        expect(await checkResetLink("t1")).toEqual({ status: "unavailable" })
    })

    it("reports an API that cannot be reached as a check that did not go through", async () => {
        vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new TypeError("fetch failed"))))

        expect(await checkResetLink("t1")).toEqual({ status: "unavailable" })
    })
})
