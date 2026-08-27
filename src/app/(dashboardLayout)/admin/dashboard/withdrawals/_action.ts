"use server"

import { getActionErrorMessage } from "@/lib/actionError"
import { createOwnerWithdrawal, deleteOwnerWithdrawal } from "@/services/agencio.services"
import type { IOwnerWithdrawal } from "@/types/agencio.types"
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types"

export const createWithdrawalAction = async (
    payload: Record<string, unknown>,
): Promise<ApiResponse<IOwnerWithdrawal> | ApiErrorResponse> => {
    try {
        return await createOwnerWithdrawal(payload)
    } catch (error: unknown) {
        // A non-owner gets the server's 403 message here rather than a blank
        // screen — the route is owner-only and that is worth saying plainly.
        return { success: false, message: getActionErrorMessage(error, "Failed to record withdrawal") }
    }
}

export const deleteWithdrawalAction = async (
    id: string,
): Promise<ApiResponse<{ message: string }> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid withdrawal id" }

    try {
        return await deleteOwnerWithdrawal(id)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Failed to delete withdrawal") }
    }
}
