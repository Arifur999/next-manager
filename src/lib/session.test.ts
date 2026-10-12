import { describe, expect, it } from "vitest"
import { classifyMeResponse } from "./session"

describe("classifyMeResponse", () => {
    it.each([
        [200, "authenticated"],
        [401, "unauthenticated"],
        [403, "unauthenticated"],
        [404, "unavailable"],
        [500, "unavailable"],
        [502, "unavailable"],
    ] as const)("maps %i to %s", (status, outcome) => {
        expect(classifyMeResponse(status)).toBe(outcome)
    })
})
