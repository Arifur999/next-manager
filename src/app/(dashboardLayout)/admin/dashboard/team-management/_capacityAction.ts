"use server"

import { getActionErrorMessage } from "@/lib/actionError"
import { setCapacity } from "@/services/agencio.services"
import type { ICapacityRow } from "@/types/agencio.types"
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types"

export const setCapacityAction = async (
    userId: string,
    payload: Record<string, unknown>,
): Promise<ApiResponse<ICapacityRow> | ApiErrorResponse> => {
    if (!userId) return { success: false, message: "Invalid user id" }

    try {
        return await setCapacity(userId, payload)
    } catch (error: unknown) {
        // The server refuses more than 80 hours a week by name, which is more
        // useful than "failed" — it is almost always a typo.
        return { success: false, message: getActionErrorMessage(error, "Failed to save capacity") }
    }
}
