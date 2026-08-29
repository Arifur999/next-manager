"use server"

import { getActionErrorMessage } from "@/lib/actionError"
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types"

const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL

/**
 * Open an agency from an invite.
 *
 * Plain fetch and no cookies set. The owner arrives active and could be given a
 * session here, but sending them through the login page once means the password
 * they just chose is one they have actually typed twice — and the first thing
 * they do is the thing they will do every morning.
 *
 * The email is not in the payload; it comes from the invite server-side. Nor is
 * the role — that is fixed to `admin` in the service, so this link can never be
 * edited into one that creates a platform operator.
 */
export const acceptAgencyInviteAction = async (
    token: string,
    payload: { full_name: string; password: string; company_name?: string },
): Promise<ApiResponse<unknown> | ApiErrorResponse> => {
    if (!token) return { success: false, message: "This invite link is incomplete" }

    try {
        const res = await fetch(
            `${BASE_API_URL}/agency-join/${encodeURIComponent(token)}/accept`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                cache: "no-store",
            },
        )

        const body = await res.json()

        if (!res.ok || !body?.success) {
            return {
                success: false,
                message: body?.message ?? "That invite link is no longer valid.",
            }
        }

        return body as ApiResponse<unknown>
    } catch (error: unknown) {
        return {
            success: false,
            message: getActionErrorMessage(error, "Could not complete your request"),
        }
    }
}
