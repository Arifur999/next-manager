"use server"

import { getActionErrorMessage } from "@/lib/actionError"
import {
    acceptMilestone,
    createMilestone,
    deleteMilestone,
    reopenMilestone,
    submitMilestone,
    updateMilestone,
} from "@/services/agencio.services"
import type { IMilestone } from "@/types/agencio.types"
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types"

type MilestoneResult = ApiResponse<IMilestone> | ApiErrorResponse

export const createMilestoneAction = async (
    payload: Record<string, unknown>,
): Promise<MilestoneResult> => {
    try {
        return await createMilestone(payload)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Failed to add the milestone") }
    }
}

export const updateMilestoneAction = async (
    id: string,
    payload: Record<string, unknown>,
): Promise<MilestoneResult> => {
    if (!id) return { success: false, message: "Invalid milestone id" }

    try {
        return await updateMilestone(id, payload)
    } catch (error: unknown) {
        // The server refuses a due-date change on a submitted milestone by
        // name, which is more use than "update failed" — a date that will not
        // move needs its reason stated.
        return { success: false, message: getActionErrorMessage(error, "Failed to update the milestone") }
    }
}

export const submitMilestoneAction = async (id: string): Promise<MilestoneResult> => {
    if (!id) return { success: false, message: "Invalid milestone id" }

    try {
        return await submitMilestone(id)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Failed to submit") }
    }
}

export const acceptMilestoneAction = async (id: string): Promise<MilestoneResult> => {
    if (!id) return { success: false, message: "Invalid milestone id" }

    try {
        return await acceptMilestone(id)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Failed to accept") }
    }
}

export const reopenMilestoneAction = async (id: string): Promise<MilestoneResult> => {
    if (!id) return { success: false, message: "Invalid milestone id" }

    try {
        return await reopenMilestone(id)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Failed to reopen") }
    }
}

export const deleteMilestoneAction = async (
    id: string,
): Promise<ApiResponse<{ message: string }> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid milestone id" }

    try {
        return await deleteMilestone(id)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Failed to delete") }
    }
}
