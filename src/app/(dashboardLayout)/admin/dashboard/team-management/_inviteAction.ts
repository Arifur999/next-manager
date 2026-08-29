"use server"

import { getActionErrorMessage } from "@/lib/actionError"
import {
    approveMember,
    createInvite,
    rejectMember,
    revokeInvite,
} from "@/services/agencio.services"
import type { ITeamInvite } from "@/types/agencio.types"
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types"

export const createInviteAction = async (
    payload: Record<string, unknown>,
): Promise<ApiResponse<{ invite: ITeamInvite; join_url: string }> | ApiErrorResponse> => {
    try {
        return await createInvite(payload)
    } catch (error: unknown) {
        // "That person is already on your team" and "That email already has an
        // account" are the server's wording and say what to do instead.
        return { success: false, message: getActionErrorMessage(error, "Could not create the invite") }
    }
}

export const revokeInviteAction = async (
    id: string,
): Promise<ApiResponse<{ message: string }> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid invite id" }

    try {
        return await revokeInvite(id)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Could not revoke the invite") }
    }
}

export const approveMemberAction = async (
    id: string,
): Promise<ApiResponse<unknown> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid member id" }

    try {
        return await approveMember(id)
    } catch (error: unknown) {
        // Approving is what charges a seat, so the plan limit surfaces here -
        // and the server names the plan in the message.
        return { success: false, message: getActionErrorMessage(error, "Could not approve") }
    }
}

export const rejectMemberAction = async (
    id: string,
    reason?: string,
): Promise<ApiResponse<unknown> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid member id" }

    try {
        return await rejectMember(id, reason ? { reason } : {})
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Could not turn the request down") }
    }
}
