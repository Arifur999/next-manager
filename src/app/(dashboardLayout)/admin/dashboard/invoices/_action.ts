"use server"

import { getActionErrorMessage } from "@/lib/actionError"
import { createInvoice, deleteInvoice, updateInvoice } from "@/services/agencio.services"
import type { IInvoice } from "@/types/agencio.types"
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types"

export const createInvoiceAction = async (
    payload: Record<string, unknown>,
): Promise<ApiResponse<IInvoice> | ApiErrorResponse> => {
    try {
        return await createInvoice(payload)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Failed to create invoice") }
    }
}

export const updateInvoiceAction = async (
    id: string,
    payload: Record<string, unknown>,
): Promise<ApiResponse<IInvoice> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid invoice id" }

    try {
        return await updateInvoice(id, payload)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Failed to update invoice") }
    }
}

export const deleteInvoiceAction = async (
    id: string,
): Promise<ApiResponse<{ message: string }> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid invoice id" }

    try {
        return await deleteInvoice(id)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Failed to delete invoice") }
    }
}
