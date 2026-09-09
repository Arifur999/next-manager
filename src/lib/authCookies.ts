// Not "use server" - same reason as cookiesUtils.ts. It is called from server
// actions, which is not the same thing as being one.

import { deleteCookie, setCookie } from "./cookiesUtils"
import { parseSetCookie } from "./parseSetCookie"

const AUTH_COOKIE_NAMES = ["accessToken", "refreshToken"]

/**
 * Next's "you cannot write cookies during a render" error, and only that one.
 *
 * Identified by its error CODE, not its class name: the class is
 * ReadonlyRequestCookiesError but it never assigns `this.name`, so `error.name`
 * is the inherited "Error" and a name check silently matches nothing - which
 * would mean every write failure re-thrown as if it were serious, or worse,
 * every one swallowed. The code is set deliberately, with
 * Object.defineProperty, and is what Next itself uses to recognise it.
 *
 * The message is a second string to match on in case that ever changes, since
 * being wrong here fails closed in an unhelpful direction either way.
 */
const isReadonlyCookiesError = (error: unknown): boolean => {
    if (!(error instanceof Error)) return false

    const code = (error as Error & { __NEXT_ERROR_CODE?: string }).__NEXT_ERROR_CODE
    return code === "E1180" || error.message.includes("Cookies can only be modified")
}

/**
 * What the API's Set-Cookie headers turned out to mean.
 *
 * A boolean could not say this. It reported "nothing happened" and "a
 * deliberate clear happened" with the same value, so login would have told
 * somebody to try again after a sign-out the API performed on purpose.
 */
export type AuthCookieOutcome =
    /** A session was written to the browser, whole. */
    | "set"
    /** The API asked for the session to be removed, and it was. */
    | "cleared"
    /** The response carried no auth cookies at all. */
    | "none"
    /** Next refused the write because this is a render, not an action. */
    | "blocked"
    /**
     * Some of it landed and some did not - one cookie set and the other
     * cleared, or a write that failed halfway. Never reported as "set",
     * because half a session is worse than none: an accessToken with no
     * refreshToken works until it expires and then dies with no way to renew,
     * which reads as a session dropping at random.
     */
    | "partial"

/**
 * Copy the API's auth cookies onto the browser.
 *
 * The Next server is a client of the API, not a pipe to it. When a server
 * action calls /auth/login with fetch, the API's Set-Cookie lands on THAT
 * response - a server-side object the browser never sees - so somebody has to
 * carry it across, and that is this.
 *
 * ── Where this can and cannot run ──────────────────────────────────────────
 *
 * Next only allows cookie writes in the "action" phase; during a Server
 * Component RENDER it throws ReadonlyRequestCookiesError
 * (request-cookies.js: `return requestStore.phase === 'action'`). So the same
 * call works from a server action or the proxy and cannot work from a
 * component rendering a page.
 *
 * That path exists: httpClient refreshes an expiring token mid-render. It is
 * reported as "blocked" rather than thrown, because it is not an error the
 * caller can do anything about, and because it is harmless here - this API's
 * refresh tokens are not single-use, verified by presenting the same one
 * twice and getting 200 both times, so a rotation that fails to store leaves
 * the old token working. The proxy refreshes for real on the next navigation.
 */
export const forwardAuthCookies = async (response: Response): Promise<AuthCookieOutcome> => {
    // getSetCookie keeps each Set-Cookie separate. A plain get("set-cookie")
    // joins them with commas, which is unparseable here because Expires dates
    // contain commas of their own.
    const headers = response.headers.getSetCookie?.() ?? []

    let set = 0
    let cleared = 0
    let blocked = false

    for (const header of headers) {
        const cookie = parseSetCookie(header)
        if (!cookie) continue

        // Only the two we know. The API is not given a free hand to set
        // arbitrary cookies on the browser through this path.
        if (!AUTH_COOKIE_NAMES.includes(cookie.name)) continue

        try {
            if (cookie.clearing) {
                await deleteCookie(cookie.name)
                cleared++
                continue
            }

            // The API's own lifetime is the one to keep - it is the side that
            // knows when the token it just signed expires.
            await setCookie(cookie.name, cookie.value, cookie.maxAge ?? 3600)
            set++
        } catch (error) {
            // ONLY the render-phase refusal. A bare catch here would have
            // swallowed an oversized value, an invalid character, or any
            // future change in Next's internals, mapped all of them to
            // "blocked", and left no log on the auth path - a real breakage
            // would have surfaced as people saying they cannot sign in, with
            // nothing to look at.
            if (isReadonlyCookiesError(error)) {
                blocked = true
                break
            }

            throw error
        }
    }

    // Order matters. A throw partway through does NOT discard what already
    // landed: reporting "blocked" after one cookie was written would tell
    // login that no session exists while the browser holds an accessToken -
    // and the proxy would then bounce that person off /login into a dashboard
    // they had just been told they could not enter.
    if (set > 0 && cleared > 0) return "partial"
    if (blocked) return set > 0 || cleared > 0 ? "partial" : "blocked"
    if (set > 0) return "set"
    if (cleared > 0) return "cleared"
    return "none"
}
