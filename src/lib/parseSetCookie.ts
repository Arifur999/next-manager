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
 * A cookie is being cleared if it says so in any of the three ways a server
 * actually says it.
 *
 * Express's res.clearCookie - which is what this API uses - sends an empty
 * value and a 1970 Expires, and deletes Max-Age entirely. A Max-Age of 0 is
 * the other convention. Handling only one of them is how a "delete" branch
 * ends up unreachable.
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

    // An EMPTY Max-Age is not a zero. Number("") is 0, which would read a
    // malformed header as "delete this cookie" - the opposite of what the
    // server that sent a value alongside it meant.
    const rawMaxAge = attribute("max-age")
    const maxAge =
        rawMaxAge !== undefined && rawMaxAge !== "" && Number.isFinite(Number(rawMaxAge))
            ? Number(rawMaxAge)
            : undefined

    const rawExpires = attribute("expires")
    const expiresAt = rawExpires ? new Date(rawExpires).getTime() : Number.NaN

    const clearing =
        value === "" ||
        (maxAge !== undefined && maxAge <= 0) ||
        (Number.isFinite(expiresAt) && expiresAt <= Date.now())

    return { name, value, maxAge, clearing }
}
