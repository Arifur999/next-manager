"use server"

import { getActionErrorMessage } from "@/lib/actionError"
import { createClientLink, deleteClientLink } from "@/services/agencio.services"
import type { IClientLink } from "@/types/agencio.types"
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types"

export const addClientLinkAction = async (
    payload: Record<string, unknown>,
): Promise<ApiResponse<IClientLink> | ApiErrorResponse> => {
    try {
        return await createClientLink(payload)
    } catch (error: unknown) {
        // "Only http and https links can be stored" and "Enter a full URL"
        // both come from the server and say what to fix.
        return { success: false, message: getActionErrorMessage(error, "Could not add the link") }
    }
}

export const removeClientLinkAction = async (
    id: string,
): Promise<ApiResponse<{ message: string }> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid link id" }

    try {
        return await deleteClientLink(id)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Could not remove the link") }
    }
}
