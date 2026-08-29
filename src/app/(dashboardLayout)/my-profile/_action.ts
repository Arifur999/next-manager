"use server"

import { getActionErrorMessage } from "@/lib/actionError"
import { updateMe } from "@/services/auth.services"
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types"
import type { IUser } from "@/types/user.types"

export const updateMeAction = async (
    payload: Record<string, unknown>,
): Promise<ApiResponse<IUser> | ApiErrorResponse> => {
    try {
        return await updateMe(payload)
    } catch (error: unknown) {
        // The server refuses fields outside its allow-list by name, which is
        // more useful than a generic failure if this form ever grows a field
        // the API does not accept.
        return { success: false, message: getActionErrorMessage(error, "Could not save your profile") }
    }
}
