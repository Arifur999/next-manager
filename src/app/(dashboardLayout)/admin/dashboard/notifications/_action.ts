"use server"

import { getActionErrorMessage } from "@/lib/actionError"
import { setNotificationRule } from "@/services/agencio.services"
import type { INotificationRule } from "@/types/agencio.types"
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types"

export const setNotificationRuleAction = async (
    event: string,
    payload: Record<string, unknown>,
): Promise<ApiResponse<INotificationRule> | ApiErrorResponse> => {
    if (!event) return { success: false, message: "Invalid event" }

    try {
        return await setNotificationRule(event, payload)
    } catch (error: unknown) {
        // "That is not something this app notifies about" arrives here — the
        // server refuses an event nothing fires rather than storing a setting
        // that could never take effect.
        return { success: false, message: getActionErrorMessage(error, "Could not save that") }
    }
}
