"use server"

import { getActionErrorMessage } from "@/lib/actionError"
import { setUserPermissions } from "@/services/user.services"
import type { IUser } from "@/types/user.types"
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types"

export const setPermissionsAction = async (
    id: string,
    permissions: string[],
): Promise<ApiResponse<IUser> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid user id" }

    try {
        return await setUserPermissions(id, permissions)
    } catch (error: unknown) {
        // "An admin already passes every check" arrives here, and already says
        // what to do instead.
        return { success: false, message: getActionErrorMessage(error, "Could not update access") }
    }
}
