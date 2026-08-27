"use server"

import { getActionErrorMessage } from "@/lib/actionError"
import { createTeamPayout, deleteTeamPayout } from "@/services/agencio.services"
import type { ITeamPayout } from "@/types/agencio.types"
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types"

export const createTeamPayoutAction = async (
    payload: Record<string, unknown>,
): Promise<ApiResponse<ITeamPayout> | ApiErrorResponse> => {
    try {
        return await createTeamPayout(payload)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Failed to record payout") }
    }
}

export const deleteTeamPayoutAction = async (
    id: string,
): Promise<ApiResponse<{ message: string }> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid payout id" }

    try {
        return await deleteTeamPayout(id)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Failed to delete payout") }
    }
}
