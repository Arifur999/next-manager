"use server"

import { getActionErrorMessage } from "@/lib/actionError"
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types"

const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL

/**
 * Accept an invite.
 *
 * Plain fetch, like login and register: whoever is here has no account yet, so
 * there are no cookies to forward — and unlike login this sets none either.
 * The account is created pending, so a session would be a session that cannot
 * do anything.
 *
 * The email is deliberately not in the payload. It comes from the invite
 * server-side; sending one from here would be offering a field the server
 * ignores, which is worse than not offering it.
 */
export const acceptInviteAction = async (
    token: string,
    payload: { full_name: string; password: string },
): Promise<ApiResponse<unknown> | ApiErrorResponse> => {
    if (!token) return { success: false, message: "This invite link is incomplete" }

    try {
        const res = await fetch(`${BASE_API_URL}/join/${encodeURIComponent(token)}/accept`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            cache: "no-store",
        })

        const body = await res.json()

        if (!res.ok || !body?.success) {
            return {
                success: false,
                message: body?.message ?? "That invite link is no longer valid.",
            }
        }

        return body as ApiResponse<unknown>
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Could not complete your request") }
    }
}
