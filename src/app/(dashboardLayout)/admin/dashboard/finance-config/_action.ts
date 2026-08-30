"use server"

import { getActionErrorMessage } from "@/lib/actionError"
import {
    createExpenseCategory,
    deleteExpenseCategory,
    refreshRate,
    setDefaultRate,
} from "@/services/agencio.services"
import type { IExpenseCategory } from "@/types/agencio.types"
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types"

export const setDefaultRateAction = async (
    rate: number | null,
): Promise<ApiResponse<unknown> | ApiErrorResponse> => {
    try {
        return await setDefaultRate(rate)
    } catch (error: unknown) {
        // The server range-checks this — a typo like 1180 would inflate every
        // reported figure by ten, and its message says so.
        return { success: false, message: getActionErrorMessage(error, "Failed to set the rate") }
    }
}

export const refreshRateAction = async (): Promise<
    ApiResponse<{ rate: number; provider: string }> | ApiErrorResponse
> => {
    try {
        return await refreshRate()
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Failed to refresh the rate") }
    }
}

export const createCategoryAction = async (
    payload: Record<string, unknown>,
): Promise<ApiResponse<IExpenseCategory> | ApiErrorResponse> => {
    try {
        return await createExpenseCategory(payload)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Failed to create the category") }
    }
}

export const deleteCategoryAction = async (
    id: string,
): Promise<ApiResponse<{ message: string }> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid category id" }

    try {
        return await deleteExpenseCategory(id)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Failed to delete the category") }
    }
}
