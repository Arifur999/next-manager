"use server"

import { getActionErrorMessage } from "@/lib/actionError"
import { createLeaveType, updateLeaveType } from "@/services/agencio.services"
import type { ILeaveType } from "@/types/agencio.types"
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types"

type Result = ApiResponse<ILeaveType> | ApiErrorResponse

export const createLeaveTypeAction = async (
    payload: Record<string, unknown>,
): Promise<Result> => {
    try {
        return await createLeaveType(payload)
    } catch (error: unknown) {
        // "\"Annual leave\" already exists" arrives here — the server matches
        // names case-insensitively, so Annual and annual are one kind, not two.
        return { success: false, message: getActionErrorMessage(error, "Could not add it") }
    }
}

export const updateLeaveTypeAction = async (
    id: string,
    payload: Record<string, unknown>,
): Promise<Result> => {
    if (!id) return { success: false, message: "Invalid leave type id" }

    try {
        return await updateLeaveType(id, payload)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Could not update it") }
    }
}
