// Not "use server" - same reason as cookiesUtils.ts. It is called from server
// actions, which is not the same thing as being one.

import { deleteCookie, setCookie } from "./cookiesUtils"
import { parseSetCookie } from "./parseSetCookie"

const AUTH_COOKIE_NAMES = ["accessToken", "refreshToken"]

/**
 * What the API's Set-Cookie headers turned out to mean.
 *
 * A boolean could not say this. It reported "nothing happened" and "a
 * deliberate clear happened" with the same value, so login would have told
 * somebody to try again after a sign-out the API performed on purpose.
 */
export type AuthCookieOutcome =
    /** A session was written to the browser. */
    | "set"
    /** The API asked for the session to be removed, and it was. */
    | "cleared"
    /** The response carried no auth cookies at all. */
    | "none"
    /** Next refused the write because this is a render, not an action. */
    | "blocked"

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
        } catch {
            // The render-phase refusal described above. Nothing was written,
            // and saying so is more use than a stack trace the caller cannot
            // act on.
            return "blocked"
        }
    }

    if (set > 0) return "set"
    if (cleared > 0) return "cleared"
    return "none"
}
