"use server"

import { getActionErrorMessage } from "@/lib/actionError"
import {
    createLoan,
    deleteLoan,
    payLoanInstalment,
    reverseLoanInstalment,
    setLoanInstalments,
    updateLoan,
} from "@/services/agencio.services"
import type { ILoan } from "@/types/agencio.types"
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types"

type Result = ApiResponse<ILoan> | ApiErrorResponse

export const createLoanAction = async (payload: Record<string, unknown>): Promise<Result> => {
    try {
        return await createLoan(payload)
    } catch (error: unknown) {
        // A loan paid into a USD account arrives here, naming both currencies.
        return { success: false, message: getActionErrorMessage(error, "Could not record it") }
    }
}

export const updateLoanAction = async (
    id: string,
    payload: Record<string, unknown>,
): Promise<Result> => {
    if (!id) return { success: false, message: "Invalid loan id" }

    try {
        return await updateLoan(id, payload)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Could not update it") }
    }
}

export const setLoanInstalmentsAction = async (
    id: string,
    payload: Record<string, unknown>,
): Promise<Result> => {
    if (!id) return { success: false, message: "Invalid loan id" }

    try {
        return await setLoanInstalments(id, payload)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Could not save it") }
    }
}

export const payLoanInstalmentAction = async (
    instalmentId: string,
    payload: Record<string, unknown>,
): Promise<Result> => {
    if (!instalmentId) return { success: false, message: "Invalid instalment id" }

    try {
        return await payLoanInstalment(instalmentId, payload)
    } catch (error: unknown) {
        // "That instalment is already paid" arrives here.
        return { success: false, message: getActionErrorMessage(error, "Could not pay it") }
    }
}

export const reverseLoanInstalmentAction = async (instalmentId: string): Promise<Result> => {
    if (!instalmentId) return { success: false, message: "Invalid instalment id" }

    try {
        return await reverseLoanInstalment(instalmentId)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Could not reverse it") }
    }
}

export const deleteLoanAction = async (
    id: string,
): Promise<ApiResponse<{ message: string }> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid loan id" }

    try {
        return await deleteLoan(id)
    } catch (error: unknown) {
        // "This loan has repayments recorded. Close it instead" arrives here.
        return { success: false, message: getActionErrorMessage(error, "Could not delete it") }
    }
}
