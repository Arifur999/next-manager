"use server"

import { getActionErrorMessage } from "@/lib/actionError"
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types"

const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL

/**
 * Ask for a reset link.
 *
 * Note there is no error branch that behaves differently for a real address:
 * the server answers identically either way, and this passes that through
 * unchanged. Even a network failure returns the same shape, because a screen
 * that shows an error only for addresses that exist leaks exactly what the API
 * refuses to.
 */
export const forgotPasswordAction = async (payload: {
    email: string
}): Promise<ApiResponse<{ message: string }> | ApiErrorResponse> => {
    try {
        const res = await fetch(`${BASE_API_URL}/auth/forgot-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            cache: "no-store",
        })

        const body = await res.json()
        return body as ApiResponse<{ message: string }>
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Could not send the link") }
    }
}
