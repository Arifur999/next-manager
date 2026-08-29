"use server"

import { getActionErrorMessage } from "@/lib/actionError"
import {
    approvePlatformAdmin,
    createPlatformInvite,
    removePlatformAdmin,
    revokePlatformInvite,
    setAdminPermissions,
} from "@/services/agencio.services"
import type { IPlatformAdmin, IPlatformInvite } from "@/types/platform.types"
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types"

export const setPermissionsAction = async (
    id: string,
    permissions: string[],
): Promise<ApiResponse<IPlatformAdmin> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid operator id" }

    try {
        return await setAdminPermissions(id, permissions)
    } catch (error: unknown) {
        // "This is the only account that can manage the platform team" comes
        // from the server and says what to do first.
        return { success: false, message: getActionErrorMessage(error, "Could not update access") }
    }
}

export const invitePlatformAdminAction = async (
    payload: Record<string, unknown>,
): Promise<ApiResponse<{ invite: IPlatformInvite; join_url: string }> | ApiErrorResponse> => {
    try {
        return await createPlatformInvite(payload)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Could not create the invite") }
    }
}

export const revokePlatformInviteAction = async (
    id: string,
): Promise<ApiResponse<{ message: string }> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid invite id" }

    try {
        return await revokePlatformInvite(id)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Could not revoke the invite") }
    }
}

export const approvePlatformAdminAction = async (
    id: string,
): Promise<ApiResponse<unknown> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid operator id" }

    try {
        return await approvePlatformAdmin(id)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Could not approve") }
    }
}

export const removePlatformAdminAction = async (
    id: string,
): Promise<ApiResponse<{ message: string }> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid operator id" }

    try {
        return await removePlatformAdmin(id)
    } catch (error: unknown) {
        // "This is the last active platform operator" arrives here.
        return { success: false, message: getActionErrorMessage(error, "Could not remove the operator") }
    }
}
