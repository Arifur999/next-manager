"use server"

import { getActionErrorMessage } from "@/lib/actionError"
import {
    createAnnouncement,
    deleteAnnouncement,
    publishAnnouncement,
    updateAnnouncement,
} from "@/services/agencio.services"
import type { IAnnouncement, IPublishResult } from "@/types/platform.types"
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types"

export const createAnnouncementAction = async (
    payload: Record<string, unknown>,
): Promise<ApiResponse<IAnnouncement> | ApiErrorResponse> => {
    try {
        return await createAnnouncement(payload)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Could not save the draft") }
    }
}

export const updateAnnouncementAction = async (
    id: string,
    payload: Record<string, unknown>,
): Promise<ApiResponse<IAnnouncement> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid announcement id" }

    try {
        return await updateAnnouncement(id, payload)
    } catch (error: unknown) {
        // "This one has already gone out, so it cannot be edited" arrives here,
        // and already says what to do instead.
        return { success: false, message: getActionErrorMessage(error, "Could not update the draft") }
    }
}

export const publishAnnouncementAction = async (
    id: string,
): Promise<ApiResponse<IPublishResult> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid announcement id" }

    try {
        return await publishAnnouncement(id)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Could not publish") }
    }
}

export const deleteAnnouncementAction = async (
    id: string,
): Promise<ApiResponse<{ id: string }> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid announcement id" }

    try {
        return await deleteAnnouncement(id)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Could not remove it") }
    }
}
