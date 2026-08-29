"use server"

import { getActionErrorMessage } from "@/lib/actionError"
import { updatePlatformSettings } from "@/services/agencio.services"
import type { IPlatformSettings } from "@/types/platform.types"
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types"

export const updateSettingsAction = async (
    payload: Record<string, unknown>,
): Promise<ApiResponse<IPlatformSettings> | ApiErrorResponse> => {
    try {
        return await updatePlatformSettings(payload)
    } catch (error: unknown) {
        // "That plan does not exist, or is not on sale" arrives here.
        return { success: false, message: getActionErrorMessage(error, "Could not save the settings") }
    }
}
