"use server"

import { getActionErrorMessage } from "@/lib/actionError"
import { createTask, updateTask } from "@/services/work.services"
import type { ITask } from "@/types/work.types"
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types"

export const createTaskAction = async (
    payload: Record<string, unknown>,
): Promise<ApiResponse<ITask> | ApiErrorResponse> => {
    try {
        return await createTask(payload)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Failed to create task") }
    }
}

export const updateTaskAction = async (
    id: string,
    payload: Record<string, unknown>,
): Promise<ApiResponse<ITask> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid task id" }

    try {
        return await updateTask(id, payload)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Failed to update task") }
    }
}
