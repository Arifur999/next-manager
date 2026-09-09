// Not "use server" - same reason as cookiesUtils.ts. It is called from server
// actions, which is not the same thing as being one.

import { deleteCookie, setCookie } from "./cookiesUtils"

const AUTH_COOKIE_NAMES = ["accessToken", "refreshToken"]

/**
 * Copy the API's auth cookies onto the browser.
 *
 * The Next server is a client of the API, not a pipe to it. When a server
 * action calls /auth/login with fetch, the API's Set-Cookie lands on THAT
 * response - a server-side object the browser never sees - so somebody has to
 * carry it across, and that is this.
 *
 * It used to be carried differently: the API also put the tokens in the
 * response body and the action read them from there. That is why removing them
 * from the body took sign-in down with it. Reading Set-Cookie is the version
 * that does not need the API to hand a credential to anything that asks; the
 * header is already there, addressed to exactly this hop.
 *
 * Returns whether anything was actually forwarded, so a caller cannot report
 * success for a refresh that set nothing.
 */
export const forwardAuthCookies = async (response: Response): Promise<boolean> => {
    // getSetCookie keeps each Set-Cookie separate. A plain get("set-cookie")
    // joins them with commas, which is unparseable here because Expires dates
    // contain commas of their own.
    const headers = response.headers.getSetCookie?.() ?? []
    let forwarded = false

    for (const header of headers) {
        const [pair, ...attributes] = header.split(";")
        const equals = pair.indexOf("=")
        if (equals === -1) continue

        const name = pair.slice(0, equals).trim()
        const value = pair.slice(equals + 1).trim()

        // Only the two we know. The API is not given a free hand to set
        // arbitrary cookies on the browser through this path.
        if (!AUTH_COOKIE_NAMES.includes(name) || !value) continue

        const maxAge = attributes
            .map((attribute) => attribute.trim())
            .find((attribute) => attribute.toLowerCase().startsWith("max-age="))
            ?.split("=")[1]

        const seconds = Number(maxAge)

        // Max-Age=0 is a DELETE instruction, not a lifetime. Treating it as
        // "no usable value" and falling back to an hour would turn a clearing
        // cookie into a fresh one - the opposite of what was asked. Nothing
        // sends one down this path today (logout clears cookies on its own
        // side), which is exactly why it is worth handling before something
        // does.
        if (Number.isFinite(seconds) && seconds <= 0) {
            await deleteCookie(name)
            continue
        }

        // Otherwise the API's own lifetime, because it is the side that knows
        // when the token it just signed expires.
        await setCookie(name, value, Number.isFinite(seconds) ? seconds : 3600)
        forwarded = true
    }

    return forwarded
}
