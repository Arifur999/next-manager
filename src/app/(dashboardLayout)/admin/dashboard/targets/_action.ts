"use server"

import { getActionErrorMessage } from "@/lib/actionError"
import { createKpiTarget, deleteKpiTarget, updateKpiTarget } from "@/services/agencio.services"
import type { IKpiTarget } from "@/types/agencio.types"
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types"

export const setTargetAction = async (
    payload: Record<string, unknown>,
): Promise<ApiResponse<IKpiTarget> | ApiErrorResponse> => {
    try {
        return await createKpiTarget(payload)
    } catch (error: unknown) {
        // The server names the problem — a percentage above 100, a quarter that
        // does not start in a quarter month, a target that already exists for
        // this period. Those messages are the useful part.
        return { success: false, message: getActionErrorMessage(error, "Failed to set the target") }
    }
}

export const updateTargetAction = async (
    id: string,
    payload: Record<string, unknown>,
): Promise<ApiResponse<IKpiTarget> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid target id" }

    try {
        return await updateKpiTarget(id, payload)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Failed to update the target") }
    }
}

export const deleteTargetAction = async (
    id: string,
): Promise<ApiResponse<{ message: string }> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid target id" }

    try {
        return await deleteKpiTarget(id)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Failed to delete the target") }
    }
}
