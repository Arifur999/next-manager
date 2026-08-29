"use server"

import { getActionErrorMessage } from "@/lib/actionError"
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types"
import type { IUser } from "@/types/user.types"

const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL

/**
 * Creates a company and its first admin.
 *
 * Plain fetch rather than httpClient, for the same reason login uses one:
 * there are no cookies to forward yet. Unlike login it sets none either —
 * register returns the user, not tokens, so the caller sends them to sign in.
 */
export const registerAction = async (payload: {
    organization_name: string
    full_name: string
    email: string
    phone?: string
    password: string
}): Promise<ApiResponse<IUser> | ApiErrorResponse> => {
    try {
        const res = await fetch(`${BASE_API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // An empty optional field is dropped rather than sent as "", which
            // the server would store as a phone number of empty string.
            body: JSON.stringify({
                ...payload,
                ...(payload.phone?.trim() ? { phone: payload.phone.trim() } : { phone: undefined }),
            }),
            cache: "no-store",
        })

        const body = await res.json()

        if (!res.ok || !body?.success) {
            return {
                success: false,
                message: body?.message ?? "Could not create your workspace",
            }
        }

        return body as ApiResponse<IUser>
    } catch (error: unknown) {
        return {
            success: false,
            message: getActionErrorMessage(error, "Could not create your workspace"),
        }
    }
}
