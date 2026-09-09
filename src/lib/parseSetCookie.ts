/**
 * What a Set-Cookie header is asking for.
 *
 * Pure: no next/headers, no I/O, so it can be unit tested directly. That is
 * the point of it being its own file - the seam test used to re-implement this
 * parsing by hand, and the copy drifted from the original within a day.
 */

export interface ParsedSetCookie {
    name: string
    value: string
    /** Seconds, when the header gave a usable one. */
    maxAge?: number
    /** True when the header is asking for the cookie to be REMOVED. */
    clearing: boolean
}

/**
 * Whether a header is asking for the cookie to be REMOVED.
 *
 * Three signals, and they are not equal - RFC 6265 4.1.2.2 is explicit:
 *
 *   "If a cookie has both the Max-Age and the Expires attribute, the Max-Age
 *    attribute has precedence and controls the expiration date of the cookie."
 *
 * That matters here rather than being pedantry, because this API sends BOTH on
 * every auth cookie: Express's res.cookie with maxAge emits Max-Age and an
 * Expires computed from the API's own clock. An earlier version of this
 * function OR'd the two, so a past Expires beat a live Max-Age - and if the
 * Next server's clock ran ahead of the API's by more than a token lifetime,
 * every login parsed as a delete and sign-in failed permanently, in a way
 * retrying could never clear.
 *
 * An empty value is the third signal and outranks both: a server sending no
 * value is not setting anything, whatever lifetime it attaches.
 */
export const parseSetCookie = (header: string): ParsedSetCookie | null => {
    const [pair, ...attributes] = header.split(";")
    const equals = pair.indexOf("=")
    if (equals === -1) return null

    const name = pair.slice(0, equals).trim()
    if (!name) return null

    const value = pair.slice(equals + 1).trim()
    const trimmed = attributes.map((attribute) => attribute.trim())

    const attribute = (key: string) => {
        const hit = trimmed.find((a) => a.toLowerCase().startsWith(`${key}=`))
        return hit === undefined ? undefined : hit.slice(key.length + 1).trim()
    }

    // A DIGIT STRING, per RFC 6265 5.2.2 - not whatever Number() will swallow.
    // Number("0x10") is 16, Number("1e3") is 1000 and Number("1.5") is 1.5, so
    // a malformed header became a real, wrong lifetime: a garbage Max-Age
    // signed somebody out sixteen seconds after signing them in, instead of
    // falling back to the default.
    // Ten years. Long enough that nothing legitimate is near it - the longest
    // this API issues is seven days - and short enough that the date arithmetic
    // downstream stays valid.
    //
    // Form was checked but not MAGNITUDE, and both matter. "100000000000000000000"
    // passes the digit test, and Next then computes
    // new Date(Date.now() + maxAge * 1000), which is an Invalid Date: the
    // header goes out as "Expires=Invalid Date", a browser rejects it and
    // stores nothing, and forwardAuthCookies still reports "set". A silently
    // sessionless login that every layer believes worked.
    const MAX_REASONABLE_AGE = 10 * 365 * 24 * 60 * 60

    const rawMaxAge = attribute("max-age")
    const parsedMaxAge =
        rawMaxAge !== undefined && /^-?[0-9]+$/.test(rawMaxAge) ? Number(rawMaxAge) : undefined
    const maxAge =
        parsedMaxAge !== undefined && Math.abs(parsedMaxAge) <= MAX_REASONABLE_AGE
            ? parsedMaxAge
            : undefined

    const rawExpires = attribute("expires")
    const expiresAt = rawExpires ? new Date(rawExpires).getTime() : Number.NaN

    const clearing =
        value === ""
            ? true
            : maxAge !== undefined
              ? // Max-Age wins outright when it is there and well formed.
                maxAge <= 0
              : Number.isFinite(expiresAt) && expiresAt <= Date.now()

    return { name, value, maxAge, clearing }
}
