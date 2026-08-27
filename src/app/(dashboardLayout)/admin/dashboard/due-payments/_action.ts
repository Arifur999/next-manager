"use server"

import { getActionErrorMessage } from "@/lib/actionError"
import {
    createDuePerson,
    createDueTransaction,
    deleteDueTransaction,
} from "@/services/agencio.services"
import type { IDuePerson, IDueTransaction } from "@/types/agencio.types"
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types"

export const createDuePersonAction = async (
    payload: Record<string, unknown>,
): Promise<ApiResponse<IDuePerson> | ApiErrorResponse> => {
    try {
        return await createDuePerson(payload)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Failed to add person") }
    }
}

export const createDueTransactionAction = async (
    payload: Record<string, unknown>,
): Promise<ApiResponse<IDueTransaction> | ApiErrorResponse> => {
    try {
        return await createDueTransaction(payload)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Failed to record transaction") }
    }
}

export const deleteDueTransactionAction = async (
    id: string,
): Promise<ApiResponse<{ message: string }> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid transaction id" }

    try {
        return await deleteDueTransaction(id)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Failed to delete transaction") }
    }
}
