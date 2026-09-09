import { describe, expect, it } from "vitest"
import { parseSetCookie } from "./parseSetCookie"

describe("parseSetCookie", () => {
    it("reads a real login cookie", () => {
        const c = parseSetCookie(
            "accessToken=abc.def.ghi; Max-Age=86400; Path=/; Expires=Mon, 07 Sep 2099 04:39:38 GMT; HttpOnly; Secure; SameSite=Lax"
        )
        expect(c).toMatchObject({ name: "accessToken", value: "abc.def.ghi", maxAge: 86400, clearing: false })
    })

    // The header this API actually sends on logout: Express's clearCookie
    // empties the value, sets a 1970 Expires, and DELETES Max-Age. A delete
    // branch that only understands Max-Age=0 never runs for it.
    it("recognises Express's clearCookie as a clear", () => {
        const c = parseSetCookie(
            "accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax"
        )
        expect(c?.clearing).toBe(true)
    })

    it("recognises Max-Age=0 as a clear", () => {
        expect(parseSetCookie("accessToken=abc; Max-Age=0; Path=/")?.clearing).toBe(true)
    })

    it("recognises a past Expires as a clear even with a value", () => {
        expect(
            parseSetCookie("accessToken=abc; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/")?.clearing
        ).toBe(true)
    })

    // Number("") is 0, which would read this as "delete" - turning a sign-in
    // into a sign-out on a malformed header.
    it("does not treat an EMPTY Max-Age as zero", () => {
        const c = parseSetCookie("accessToken=abc.def.ghi; Max-Age=; Path=/")
        expect(c?.clearing).toBe(false)
        expect(c?.maxAge).toBeUndefined()
    })

    it("ignores a non-numeric Max-Age rather than trusting it", () => {
        expect(parseSetCookie("accessToken=abc; Max-Age=soon; Path=/")?.maxAge).toBeUndefined()
    })

    // A JWT is three base64 segments joined by dots, and an Expires date has a
    // comma in it. Neither may confuse the split.
    it("keeps a value containing dots and survives a comma in Expires", () => {
        const c = parseSetCookie(
            "refreshToken=aa.bb.cc; Expires=Sun, 13 Sep 2099 04:39:38 GMT; Max-Age=604800; Path=/"
        )
        expect(c).toMatchObject({ name: "refreshToken", value: "aa.bb.cc", maxAge: 604800, clearing: false })
    })

    it("is case-insensitive about attribute names", () => {
        expect(parseSetCookie("accessToken=abc; MAX-AGE=60; path=/")?.maxAge).toBe(60)
    })

    it("returns null for a header with no name", () => {
        expect(parseSetCookie("=value; Path=/")).toBeNull()
        expect(parseSetCookie("nonsense")).toBeNull()
    })
})
