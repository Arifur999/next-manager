"use server"

import { getActionErrorMessage } from "@/lib/actionError"
import {
    acceptMilestone,
    createMilestone,
    deleteMilestone,
    reopenMilestone,
    setProjectBaseline,
    submitMilestone,
    updateMilestone,
} from "@/services/agencio.services"
import type { IMilestone, IProject } from "@/types/agencio.types"
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

export const setBaselineAction = async (
    projectId: string,
    payload: Record<string, unknown>,
): Promise<ApiResponse<IProject> | ApiErrorResponse> => {
    if (!projectId) return { success: false, message: "Invalid project id" }

    try {
        return await setProjectBaseline(projectId, payload)
    } catch (error: unknown) {
        // The 409 on a second baseline explains what replacing it costs. That
        // sentence is the entire safeguard, so it is passed through intact.
        return { success: false, message: getActionErrorMessage(error, "Failed to set the baseline") }
    }
}
