"use server"

import { getActionErrorMessage } from "@/lib/actionError"
import { changePassword } from "@/services/auth.services"
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types"

export const changePasswordAction = async (
    payload: Record<string, unknown>,
): Promise<ApiResponse<{ message: string }> | ApiErrorResponse> => {
    try {
        return await changePassword(payload)
    } catch (error: unknown) {
        // "Current password is incorrect" is the whole message worth showing.
        return {
            success: false,
            message: getActionErrorMessage(error, "Could not change your password"),
        }
    }
}
