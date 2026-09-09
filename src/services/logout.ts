"use server"

import { AUTH_COOKIE_NAMES } from "@/lib/authCookies"
import { deleteCookie } from "@/lib/cookiesUtils"

/**
 * End the session in this browser.
 *
 * Its own module, and the ONLY thing here, because "use server" publishes
 * every export of a file as a callable endpoint. auth.services.ts carried the
 * directive for this one function's sake and so also published getUserInfo,
 * updateMe and changePassword - and a caller invoking the changePassword
 * action id directly skipped changePasswordAction entirely, so the password
 * changed and the browser kept its cookies. That is the exact defect the
 * action was written to close, reachable by going around it.
 *
 * This one is safe to publish: it takes no arguments, returns nothing, reads
 * nothing back, and does to the caller's own browser what the caller could do
 * by clearing their cookies.
 *
 * From the list rather than from memory - a cookie added to AUTH_COOKIE_NAMES
 * is forwarded on login, and without this it would never be cleared.
 */
export const logout = async () => {
    for (const name of AUTH_COOKIE_NAMES) {
        await deleteCookie(name)
    }
}
