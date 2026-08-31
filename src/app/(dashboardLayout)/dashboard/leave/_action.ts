"use server"

import { getActionErrorMessage } from "@/lib/actionError"
import { cancelLeave, decideLeave, requestLeave } from "@/services/agencio.services"
import type { ILeaveRequest } from "@/types/agencio.types"
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types"

type Result = ApiResponse<ILeaveRequest> | ApiErrorResponse

export const requestLeaveAction = async (
    payload: Record<string, unknown>,
): Promise<Result> => {
    try {
        return await requestLeave(payload)
    } catch (error: unknown) {
        // "You already have approved leave covering those dates" arrives here,
        // and already says what to do about it.
        return { success: false, message: getActionErrorMessage(error, "Could not send it") }
    }
}

export const cancelLeaveAction = async (id: string): Promise<Result> => {
    if (!id) return { success: false, message: "Invalid request id" }

    try {
        return await cancelLeave(id)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Could not withdraw it") }
    }
}

export const decideLeaveAction = async (
    id: string,
    payload: Record<string, unknown>,
): Promise<Result> => {
    if (!id) return { success: false, message: "Invalid request id" }

    try {
        return await decideLeave(id, payload)
    } catch (error: unknown) {
        // "Somebody else has to decide your own leave" arrives here.
        return { success: false, message: getActionErrorMessage(error, "Could not decide it") }
    }
}
