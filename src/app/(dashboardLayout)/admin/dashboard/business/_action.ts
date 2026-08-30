"use server"

import { getActionErrorMessage } from "@/lib/actionError"
import { updateOrganization } from "@/services/agencio.services"
import type { IOrganization } from "@/types/agencio.types"
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types"

export const updateOrganizationAction = async (
    payload: Record<string, unknown>,
): Promise<ApiResponse<IOrganization> | ApiErrorResponse> => {
    try {
        return await updateOrganization(payload)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Failed to update the profile") }
    }
}
