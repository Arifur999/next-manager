"use server"

import { getActionErrorMessage } from "@/lib/actionError"
import {
    approveTimeEntry,
    createTimeEntry,
    unapproveTimeEntry,
} from "@/services/work.services"
import type { ITimeEntry } from "@/types/work.types"
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types"

export const logTimeAction = async (
    payload: Record<string, unknown>,
): Promise<ApiResponse<ITimeEntry> | ApiErrorResponse> => {
    try {
        return await createTimeEntry(payload)
    } catch (error: unknown) {
        // The server explains a misplaced decimal point and a task from the
        // wrong project by name — those messages are worth more than a generic
        // failure, so they come straight through.
        return { success: false, message: getActionErrorMessage(error, "Failed to log time") }
    }
}

export const approveTimeAction = async (
    id: string,
): Promise<ApiResponse<ITimeEntry> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid entry id" }

    try {
        return await approveTimeEntry(id)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Failed to approve") }
    }
}

export const unapproveTimeAction = async (
    id: string,
): Promise<ApiResponse<ITimeEntry> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid entry id" }

    try {
        return await unapproveTimeEntry(id)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Failed to remove approval") }
    }
}
