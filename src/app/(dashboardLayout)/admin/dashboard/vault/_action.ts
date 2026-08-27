"use server"

import { getActionErrorMessage } from "@/lib/actionError"
import {
    createCredential,
    deleteCredential,
    getCredentialAccessLog,
    revealCredential,
} from "@/services/agencio.services"
import type { ICredential, ICredentialAccessEntry, IRevealedCredential } from "@/types/agencio.types"
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types"

export const createCredentialAction = async (
    payload: Record<string, unknown>,
): Promise<ApiResponse<ICredential> | ApiErrorResponse> => {
    try {
        return await createCredential(payload)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Failed to save credential") }
    }
}

/**
 * The only path that returns a real password.
 *
 * Deliberately its own action rather than part of the list: the server logs
 * every call, so this must only ever run when somebody actually asked to see
 * the secret — never as part of loading a page.
 */
export const revealCredentialAction = async (
    id: string,
): Promise<ApiResponse<IRevealedCredential> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid credential id" }

    try {
        return await revealCredential(id)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Failed to reveal credential") }
    }
}

export const getAccessLogAction = async (
    id: string,
): Promise<ApiResponse<ICredentialAccessEntry[]> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid credential id" }

    try {
        return await getCredentialAccessLog(id)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Failed to load access log") }
    }
}

export const deleteCredentialAction = async (
    id: string,
): Promise<ApiResponse<{ message: string }> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid credential id" }

    try {
        return await deleteCredential(id)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Failed to delete credential") }
    }
}
