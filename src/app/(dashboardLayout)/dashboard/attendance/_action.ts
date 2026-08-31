"use server"

import { getActionErrorMessage } from "@/lib/actionError"
import { clockAttendance, recordAttendance } from "@/services/agencio.services"
import type { IAttendance } from "@/types/agencio.types"
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types"

type Result = ApiResponse<IAttendance> | ApiErrorResponse

export const clockAction = async (): Promise<Result> => {
    try {
        return await clockAttendance()
    } catch (error: unknown) {
        // "You have already checked out today" arrives here.
        return { success: false, message: getActionErrorMessage(error, "Could not record that") }
    }
}

export const recordAttendanceAction = async (
    payload: Record<string, unknown>,
): Promise<Result> => {
    try {
        return await recordAttendance(payload)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Could not record it") }
    }
}
