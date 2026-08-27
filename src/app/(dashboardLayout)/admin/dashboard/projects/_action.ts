"use server"

import { getActionErrorMessage } from "@/lib/actionError"
import { createProject, deleteProject, updateProject } from "@/services/agencio.services"
import type { IProject } from "@/types/agencio.types"
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types"

export const createProjectAction = async (
    payload: Record<string, unknown>,
): Promise<ApiResponse<IProject> | ApiErrorResponse> => {
    try {
        return await createProject(payload)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Failed to create project") }
    }
}

export const updateProjectAction = async (
    id: string,
    payload: Record<string, unknown>,
): Promise<ApiResponse<IProject> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid project id" }

    try {
        return await updateProject(id, payload)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Failed to update project") }
    }
}

export const deleteProjectAction = async (
    id: string,
): Promise<ApiResponse<{ message: string }> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid project id" }

    try {
        return await deleteProject(id)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Failed to delete project") }
    }
}
