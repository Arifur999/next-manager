"use server"

import { getActionErrorMessage } from "@/lib/actionError"
import {
    createDistribution,
    createShareholder,
    deleteDistribution,
    deleteShareholder,
    updateShareholder,
} from "@/services/agencio.services"
import type { IShareholder, IShareholderDistribution } from "@/types/agencio.types"
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types"

type Result = ApiResponse<IShareholder> | ApiErrorResponse
type Removed = ApiResponse<{ message: string }> | ApiErrorResponse

export const createShareholderAction = async (
    payload: Record<string, unknown>,
): Promise<Result> => {
    try {
        return await createShareholder(payload)
    } catch (error: unknown) {
        // "Shares would total 120%. The others already hold 90%." arrives here,
        // and already says what to do about it.
        return { success: false, message: getActionErrorMessage(error, "Could not add them") }
    }
}

export const updateShareholderAction = async (
    id: string,
    payload: Record<string, unknown>,
): Promise<Result> => {
    if (!id) return { success: false, message: "Invalid shareholder id" }

    try {
        return await updateShareholder(id, payload)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Could not update them") }
    }
}

export const deleteShareholderAction = async (id: string): Promise<Removed> => {
    if (!id) return { success: false, message: "Invalid shareholder id" }

    try {
        return await deleteShareholder(id)
    } catch (error: unknown) {
        // "This shareholder has distributions recorded" arrives here.
        return { success: false, message: getActionErrorMessage(error, "Could not delete them") }
    }
}

export const createDistributionAction = async (
    payload: Record<string, unknown>,
): Promise<ApiResponse<IShareholderDistribution> | ApiErrorResponse> => {
    try {
        return await createDistribution(payload)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Could not record it") }
    }
}

export const deleteDistributionAction = async (id: string): Promise<Removed> => {
    if (!id) return { success: false, message: "Invalid distribution id" }

    try {
        return await deleteDistribution(id)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Could not reverse it") }
    }
}
