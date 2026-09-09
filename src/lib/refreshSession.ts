/**
 * Renew a session from a refresh token.
 *
 * Deliberately NOT in a "use server" module, and this is the export that made
 * that matter. The directive publishes every export as an endpoint, and this
 * one takes a credential as an argument and writes auth cookies with the
 * result - so as an action it was session fixation: an attacker POSTs their
 * own refresh token, forwardAuthCookies writes THEIR accessToken onto the
 * victim's browser, and the victim carries on inside the attacker's account
 * without ever seeing a login screen.
 *
 * Both callers - the proxy and httpClient - are server-side, so nothing is
 * lost by making it an ordinary function again.
 */

import { SERVER_API_BASE_URL } from "@/lib/apiBaseUrl"
import { forwardAuthCookies } from "@/lib/authCookies"

const BASE_API_URL = SERVER_API_BASE_URL

// Uses fetch rather than httpClient on purpose: httpClient calls back into this
// module to refresh, so going through it here would recurse.
export async function getNewTokensWithRefreshToken(refreshToken: string): Promise<boolean> {
    try {
        const res = await fetch(`${BASE_API_URL}/auth/refresh-token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Cookie: `refreshToken=${refreshToken}`,
            },
            cache: "no-store",
        })

        if (!res.ok) {
            return false
        }

        // Whether the rotation actually reached the browser, not whether the
        // call returned 200. Reporting true for a refresh that stored nothing
        // made the proxy stamp x-token-refreshed on the request, which tells
        // every Server Component below it not to bother - so a session would
        // spin on a wasted round trip per request until the token really
        // expired and then bounce to /login.
        //
        // "blocked" is a false too, and deliberately so: it means this ran
        // during a render, where Next will not let anything write a cookie.
        // Nothing was stored, so nothing downstream should be told otherwise.
        return (await forwardAuthCookies(res)) === "set"
    } catch (error) {
        console.error("Error refreshing token:", error)
        return false
    }
}
