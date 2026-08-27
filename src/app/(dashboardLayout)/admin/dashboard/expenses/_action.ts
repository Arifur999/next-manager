"use server"

import { getActionErrorMessage } from "@/lib/actionError"
import {
    createExpense,
    createExpenseCategory,
    deleteExpense,
    deleteExpenseCategory,
} from "@/services/agencio.services"
import type { IExpense, IExpenseCategory } from "@/types/agencio.types"
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types"

export const createExpenseAction = async (
    payload: Record<string, unknown>,
): Promise<ApiResponse<IExpense> | ApiErrorResponse> => {
    try {
        return await createExpense(payload)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Failed to record expense") }
    }
}

export const deleteExpenseAction = async (
    id: string,
): Promise<ApiResponse<{ message: string }> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid expense id" }

    try {
        return await deleteExpense(id)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Failed to delete expense") }
    }
}

export const createExpenseCategoryAction = async (
    payload: Record<string, unknown>,
): Promise<ApiResponse<IExpenseCategory> | ApiErrorResponse> => {
    try {
        return await createExpenseCategory(payload)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Failed to create category") }
    }
}

export const deleteExpenseCategoryAction = async (
    id: string,
): Promise<ApiResponse<{ message: string }> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid category id" }

    try {
        return await deleteExpenseCategory(id)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Failed to delete category") }
    }
}
