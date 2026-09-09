"use server"

import { getActionErrorMessage } from "@/lib/actionError"
import { changePassword } from "@/services/auth.services"
import { logout } from "@/services/logout"
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types"

/**
 * Change the password, and end the session it was changed from.
 *
 * The API already does its half: it bumps token_version, which retires every
 * token issued before now, and clears its own cookies. But that clearing
 * Set-Cookie lands on an axios response inside httpClient and never reaches
 * the browser - so without this the browser kept tokens that no longer work.
 *
 * Nobody could USE them: the layout calls getUserInfo, the API answers 401,
 * and the person is redirected to /login. So this is tidiness rather than a
 * hole - but a session the server has ended should not still look live in the
 * browser, and finding out by being bounced is a worse way to learn it.
 */
export const changePasswordAction = async (
    payload: Record<string, unknown>,
): Promise<ApiResponse<{ message: string }> | ApiErrorResponse> => {
    try {
        const result = await changePassword(payload)

        // Checked, not assumed. httpClient returns response.data for every
        // 2xx, so a 200 carrying { success: false } reaches here - and the
        // form branches on exactly that, shows an error and does NOT redirect.
        // Signing that person out would leave them on the page being told the
        // change failed, with the session already gone, discovering it only on
        // their next click.
        if (result.success) {
            // logout() rather than two deletes of its own. There is one
            // definition of what ending a session means, and when it grows a
            // step this gets it too.
            await logout()
        }

        return result
    } catch (error: unknown) {
        // "Current password is incorrect" is the whole message worth showing.
        return {
            success: false,
            message: getActionErrorMessage(error, "Could not change your password"),
        }
    }
}
