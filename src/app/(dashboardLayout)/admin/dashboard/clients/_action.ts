"use server"

import { getActionErrorMessage } from "@/lib/actionError"
import { createClient, deleteClient, updateClient } from "@/services/agencio.services"
import type { IClient } from "@/types/agencio.types"
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types"

export const createClientAction = async (
    payload: Record<string, unknown>,
): Promise<ApiResponse<IClient> | ApiErrorResponse> => {
    try {
        return await createClient(payload)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Failed to create client") }
    }
}

export const updateClientAction = async (
    id: string,
    payload: Record<string, unknown>,
): Promise<ApiResponse<IClient> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid client id" }

    try {
        return await updateClient(id, payload)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Failed to update client") }
    }
}

export const deleteClientAction = async (
    id: string,
): Promise<ApiResponse<{ message: string }> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid client id" }

    try {
        return await deleteClient(id)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Failed to delete client") }
    }
}
