"use server"

import { getActionErrorMessage } from "@/lib/actionError"
import { createPayment, deletePayment } from "@/services/agencio.services"
import type { IPayment } from "@/types/agencio.types"
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types"

export const createPaymentAction = async (
    payload: Record<string, unknown>,
): Promise<ApiResponse<IPayment> | ApiErrorResponse> => {
    try {
        return await createPayment(payload)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Failed to record payment") }
    }
}

export const deletePaymentAction = async (
    id: string,
): Promise<ApiResponse<{ message: string }> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid payment id" }

    try {
        return await deletePayment(id)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Failed to delete payment") }
    }
}
