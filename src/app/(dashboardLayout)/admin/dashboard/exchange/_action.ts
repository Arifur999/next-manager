"use server"

import { getActionErrorMessage } from "@/lib/actionError"
import { createExchange, deleteExchange } from "@/services/agencio.services"
import type { IExchange } from "@/types/agencio.types"
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types"

export const createExchangeAction = async (
    payload: Record<string, unknown>,
): Promise<ApiResponse<IExchange> | ApiErrorResponse> => {
    try {
        return await createExchange(payload)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Failed to record exchange") }
    }
}

export const deleteExchangeAction = async (
    id: string,
): Promise<ApiResponse<{ message: string }> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid exchange id" }

    try {
        return await deleteExchange(id)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Failed to delete exchange") }
    }
}
