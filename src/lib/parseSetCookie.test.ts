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

    // The combination this API actually sends on every auth cookie, and the
    // one the first version of these tests never covered: Express emits BOTH
    // Max-Age and an Expires derived from its own clock. RFC 6265 4.1.2.2
    // gives Max-Age precedence, so a live Max-Age must survive an Expires that
    // has already passed - which is what a clock running ahead of the API's
    // looks like. OR-ing the two made every login parse as a delete.
    it("gives Max-Age precedence over a past Expires", () => {
        const c = parseSetCookie(
            "accessToken=aa.bb.cc; Max-Age=86400; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/"
        )
        expect(c).toMatchObject({ maxAge: 86400, clearing: false })
    })

    it("and over a future Expires when Max-Age says to clear", () => {
        const c = parseSetCookie(
            "accessToken=abc; Max-Age=0; Expires=Sun, 13 Sep 2099 04:39:38 GMT; Path=/"
        )
        expect(c?.clearing).toBe(true)
    })

    it("falls back to Expires only when Max-Age is absent or malformed", () => {
        expect(parseSetCookie("a=b; Expires=Thu, 01 Jan 1970 00:00:00 GMT")?.clearing).toBe(true)
        expect(parseSetCookie("a=b; Max-Age=nope; Expires=Thu, 01 Jan 1970 00:00:00 GMT")?.clearing).toBe(true)
    })

    // Number() swallows far more than a cookie lifetime may be. Each of these
    // used to become a real, wrong Max-Age - a garbage header signing somebody
    // out sixteen seconds after signing them in.
    it("requires Max-Age to be a digit string", () => {
        expect(parseSetCookie("a=b; Max-Age=0x10")?.maxAge).toBeUndefined()
        expect(parseSetCookie("a=b; Max-Age=1e3")?.maxAge).toBeUndefined()
        expect(parseSetCookie("a=b; Max-Age=1.5")?.maxAge).toBeUndefined()
        expect(parseSetCookie("a=b; Max-Age= 60 ")?.maxAge).toBe(60)
        expect(parseSetCookie("a=b; Max-Age=-1")?.clearing).toBe(true)
    })

    // An empty value outranks any lifetime: a server sending no value is not
    // setting anything, whatever it attaches.
    it("treats an empty value as a clear even with a live Max-Age", () => {
        expect(parseSetCookie("accessToken=; Max-Age=86400; Path=/")?.clearing).toBe(true)
    })

    // Digits, but not a lifetime. Next computes new Date(now + maxAge*1000)
    // from this, which overflows to an Invalid Date and puts
    // "Expires=Invalid Date" on the wire - a header browsers drop, while
    // everything upstream believes the cookie was set.
    it("rejects a Max-Age too large to be a date", () => {
        expect(parseSetCookie("a=b; Max-Age=100000000000000000000")?.maxAge).toBeUndefined()
        expect(parseSetCookie("a=b; Max-Age=604800")?.maxAge).toBe(604800)
    })
})
