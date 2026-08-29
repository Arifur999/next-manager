"use server"

import { getActionErrorMessage } from "@/lib/actionError"
import { createPlan, setSubscription, updatePlan } from "@/services/agencio.services"
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types"
import type { IPlan, ISubscription } from "@/types/platform.types"

export const setSubscriptionAction = async (
    organizationId: string,
    payload: Record<string, unknown>,
): Promise<ApiResponse<ISubscription> | ApiErrorResponse> => {
    if (!organizationId) return { success: false, message: "Invalid company id" }

    try {
        return await setSubscription(organizationId, payload)
    } catch (error: unknown) {
        return {
            success: false,
            message: getActionErrorMessage(error, "Could not update the subscription"),
        }
    }
}

export const createPlanAction = async (
    payload: Record<string, unknown>,
): Promise<ApiResponse<IPlan> | ApiErrorResponse> => {
    try {
        return await createPlan(payload)
    } catch (error: unknown) {
        // A duplicate code and a zero-seat plan are both refused by name, and
        // both messages say what to do instead.
        return { success: false, message: getActionErrorMessage(error, "Could not create the plan") }
    }
}

export const updatePlanAction = async (
    id: string,
    payload: Record<string, unknown>,
): Promise<ApiResponse<IPlan> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid plan id" }

    try {
        return await updatePlan(id, payload)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Could not update the plan") }
    }
}
