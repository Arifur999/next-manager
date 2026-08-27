"use server"

import {
    createAccount,
    deleteAccount,
    updateAccount,
} from "@/services/agencio.services"
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types"
import type { IAccount } from "@/types/agencio.types"
import { getActionErrorMessage } from "@/lib/actionError"

export const createAccountAction = async (
    payload: Record<string, unknown>,
): Promise<ApiResponse<IAccount> | ApiErrorResponse> => {
    try {
        return await createAccount(payload)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Failed to create account") }
    }
}

export const updateAccountAction = async (
    id: string,
    payload: Record<string, unknown>,
): Promise<ApiResponse<IAccount> | ApiErrorResponse> => {
    if (!id) {
        return { success: false, message: "Invalid account id" }
    }

    try {
        return await updateAccount(id, payload)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Failed to update account") }
    }
}

export const deleteAccountAction = async (
    id: string,
): Promise<ApiResponse<{ message: string }> | ApiErrorResponse> => {
    if (!id) {
        return { success: false, message: "Invalid account id" }
    }

    try {
        return await deleteAccount(id)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Failed to delete account") }
    }
}
