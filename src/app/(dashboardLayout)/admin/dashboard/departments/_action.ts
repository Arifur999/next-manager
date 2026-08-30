"use server"

import { getActionErrorMessage } from "@/lib/actionError"
import { createDepartment, deleteDepartment, updateDepartment } from "@/services/agencio.services"
import type { IDepartment } from "@/types/agencio.types"
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types"

export const createDepartmentAction = async (
    payload: Record<string, unknown>,
): Promise<ApiResponse<IDepartment> | ApiErrorResponse> => {
    try {
        return await createDepartment(payload)
    } catch (error: unknown) {
        // "\"Design\" already exists" arrives here — the server matches names
        // case-insensitively, so Design and design are one team, not two.
        return { success: false, message: getActionErrorMessage(error, "Could not create it") }
    }
}

export const updateDepartmentAction = async (
    id: string,
    payload: Record<string, unknown>,
): Promise<ApiResponse<IDepartment> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid department id" }

    try {
        return await updateDepartment(id, payload)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Could not update it") }
    }
}

export const deleteDepartmentAction = async (
    id: string,
): Promise<ApiResponse<{ message: string }> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid department id" }

    try {
        return await deleteDepartment(id)
    } catch (error: unknown) {
        // "4 people are in Design. Move them first, or turn it off instead of
        // deleting it." arrives here and already says what to do.
        return { success: false, message: getActionErrorMessage(error, "Could not delete it") }
    }
}
