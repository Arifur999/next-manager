"use server"

import { getActionErrorMessage } from "@/lib/actionError"
import { createAgencyInvite, revokeAgencyInvite } from "@/services/agencio.services"
import type { IAgencyInvite } from "@/types/platform.types"
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types"

export const inviteAgencyAction = async (
    payload: Record<string, unknown>,
): Promise<
    | ApiResponse<{
          invite: IAgencyInvite
          join_url: string
          email: { delivered: boolean; reason: string | null }
      }>
    | ApiErrorResponse
> => {
    try {
        return await createAgencyInvite(payload)
    } catch (error: unknown) {
        // "One address cannot own two agencies" arrives here.
        return { success: false, message: getActionErrorMessage(error, "Could not send the invite") }
    }
}

export const revokeAgencyInviteAction = async (
    id: string,
): Promise<ApiResponse<{ message: string }> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid invite id" }

    try {
        return await revokeAgencyInvite(id)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Could not revoke the invite") }
    }
}
