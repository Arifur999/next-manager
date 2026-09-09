"use server"

import { getActionErrorMessage } from "@/lib/actionError"
import { deleteCookie } from "@/lib/cookiesUtils"
import { changePassword } from "@/services/auth.services"
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

        // Only on success. A wrong current password must not sign anybody out.
        await deleteCookie("accessToken")
        await deleteCookie("refreshToken")

        return result
    } catch (error: unknown) {
        // "Current password is incorrect" is the whole message worth showing.
        return {
            success: false,
            message: getActionErrorMessage(error, "Could not change your password"),
        }
    }
}
