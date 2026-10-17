"use server"

import { runValidatedAction } from "@/lib/runAction"
import { changePassword } from "@/services/auth.services"
import { logout } from "@/services/logout"
import { changePasswordServerZodSchema } from "@/zod/auth.validation"

/**
 * Change the password, and end the session it was changed from.
 *
 * The API retires every earlier token and clears its own cookies, but that
 * Set-Cookie lands on httpClient's response, never in the browser, so logout()
 * clears them here. Only after a confirmed success: a 200 carrying
 * `success: false` must leave the person signed in, reading the error.
 */
export const changePasswordAction = async (values: unknown) => {
    const result = await runValidatedAction(
        changePasswordServerZodSchema,
        values,
        "Could not change your password",
        changePassword,
    )

    if (result.success) await logout()
    return result
}
