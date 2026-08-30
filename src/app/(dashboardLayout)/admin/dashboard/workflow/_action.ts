"use server"

import { getActionErrorMessage } from "@/lib/actionError"
import {
    createWorkflowStatus,
    deleteWorkflowStatus,
    updateWorkflowStatus,
} from "@/services/agencio.services"
import type { IWorkflowStatus } from "@/types/agencio.types"
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types"

export const createWorkflowStatusAction = async (
    payload: Record<string, unknown>,
): Promise<ApiResponse<IWorkflowStatus> | ApiErrorResponse> => {
    try {
        return await createWorkflowStatus(payload)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Could not add it") }
    }
}

export const updateWorkflowStatusAction = async (
    id: string,
    payload: Record<string, unknown>,
): Promise<ApiResponse<IWorkflowStatus> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid status id" }

    try {
        return await updateWorkflowStatus(id, payload)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Could not change it") }
    }
}

export const deleteWorkflowStatusAction = async (
    id: string,
): Promise<ApiResponse<{ message: string }> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid status id" }

    try {
        return await deleteWorkflowStatus(id)
    } catch (error: unknown) {
        // "4 tasks are on In QA. Move them first, or turn it off instead of
        // deleting it." arrives here and already says what to do.
        return { success: false, message: getActionErrorMessage(error, "Could not remove it") }
    }
}
