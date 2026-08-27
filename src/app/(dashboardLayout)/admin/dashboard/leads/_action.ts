"use server"

import { getActionErrorMessage } from "@/lib/actionError"
import { convertLead, createLead, deleteLead, updateLead } from "@/services/agencio.services"
import type { IClient } from "@/types/agencio.types"
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types"

export const createLeadAction = async (
    payload: Record<string, unknown>,
): Promise<ApiResponse<unknown> | ApiErrorResponse> => {
    try {
        return await createLead(payload)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Failed to create lead") }
    }
}

export const updateLeadAction = async (
    id: string,
    payload: Record<string, unknown>,
): Promise<ApiResponse<unknown> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid lead id" }

    try {
        return await updateLead(id, payload)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Failed to update lead") }
    }
}

export const convertLeadAction = async (
    id: string,
): Promise<ApiResponse<IClient> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid lead id" }

    try {
        return await convertLead(id)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Failed to convert lead") }
    }
}

export const deleteLeadAction = async (
    id: string,
): Promise<ApiResponse<unknown> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid lead id" }

    try {
        return await deleteLead(id)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Failed to delete lead") }
    }
}
