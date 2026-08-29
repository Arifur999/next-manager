"use server"

import { getActionErrorMessage } from "@/lib/actionError"
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types"

const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export const resetPasswordAction = async (payload: {
    token: string
    new_password: string
}): Promise<ApiResponse<{ message: string }> | ApiErrorResponse> => {
    try {
        const res = await fetch(`${BASE_API_URL}/auth/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            cache: "no-store",
        })

        const body = await res.json()

        if (!res.ok || !body?.success) {
            // One sentence for expired, spent and unknown — the server does not
            // distinguish them and neither should this.
            return {
                success: false,
                message: body?.message ?? "That reset link is no longer valid. Ask for a new one.",
            }
        }

        return body as ApiResponse<{ message: string }>
    } catch (error: unknown) {
        return {
            success: false,
            message: getActionErrorMessage(error, "Could not reset your password"),
        }
    }
}
