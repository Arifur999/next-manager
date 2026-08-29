"use server"

import { getActionErrorMessage } from "@/lib/actionError"
import { createPlatformExpense, deletePlatformExpense } from "@/services/agencio.services"
import type { IPlatformExpense } from "@/types/platform.types"
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types"

export const addPlatformExpenseAction = async (
    payload: Record<string, unknown>,
): Promise<ApiResponse<IPlatformExpense> | ApiErrorResponse> => {
    try {
        return await createPlatformExpense(payload)
    } catch (error: unknown) {
        // "An expense of zero is not an expense" and the permission refusal
        // both come from the server and say what to change.
        return { success: false, message: getActionErrorMessage(error, "Could not record the expense") }
    }
}

export const removePlatformExpenseAction = async (
    id: string,
): Promise<ApiResponse<{ message: string }> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid expense id" }

    try {
        return await deletePlatformExpense(id)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Could not remove the expense") }
    }
}
