"use server"

import { getActionErrorMessage } from "@/lib/actionError"
import {
    createConversation,
    markConversationRead,
    sendMessage,
    setConversationArchived,
} from "@/services/agencio.services"
import type { IMessage } from "@/types/agencio.types"
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types"

type Simple = ApiResponse<{ message: string }> | ApiErrorResponse

export const createConversationAction = async (
    payload: Record<string, unknown>,
): Promise<ApiResponse<{ id: string }> | ApiErrorResponse> => {
    try {
        return await createConversation(payload)
    } catch (error: unknown) {
        // "Somebody on that list is not on your team" arrives here — the server
        // checks every id against this agency before writing a single row.
        return { success: false, message: getActionErrorMessage(error, "Could not start it") }
    }
}

export const sendMessageAction = async (
    id: string,
    payload: Record<string, unknown>,
): Promise<ApiResponse<IMessage> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid conversation id" }

    try {
        return await sendMessage(id, payload)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Could not send it") }
    }
}

export const markConversationReadAction = async (id: string): Promise<Simple> => {
    if (!id) return { success: false, message: "Invalid conversation id" }

    try {
        return await markConversationRead(id)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Could not mark it read") }
    }
}

export const setConversationArchivedAction = async (
    id: string,
    archived: boolean,
): Promise<Simple> => {
    if (!id) return { success: false, message: "Invalid conversation id" }

    try {
        return await setConversationArchived(id, archived)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Could not archive it") }
    }
}
