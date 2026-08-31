"use server"

import { getActionErrorMessage } from "@/lib/actionError"
import {
    completePayroll,
    createPayrollRun,
    deletePayrollRun,
    setPayrollItems,
} from "@/services/agencio.services"
import type { IPayrollRun } from "@/types/agencio.types"
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types"

type Result = ApiResponse<IPayrollRun> | ApiErrorResponse

export const createPayrollRunAction = async (
    payload: Record<string, unknown>,
): Promise<Result> => {
    try {
        return await createPayrollRun(payload)
    } catch (error: unknown) {
        // "There is already a draft payroll run for that month" arrives here.
        return { success: false, message: getActionErrorMessage(error, "Could not open it") }
    }
}

export const setPayrollItemsAction = async (
    id: string,
    payload: Record<string, unknown>,
): Promise<Result> => {
    if (!id) return { success: false, message: "Invalid payroll id" }

    try {
        return await setPayrollItems(id, payload)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Could not save it") }
    }
}

export const completePayrollAction = async (
    id: string,
    payload: Record<string, unknown>,
): Promise<Result> => {
    if (!id) return { success: false, message: "Invalid payroll id" }

    try {
        return await completePayroll(id, payload)
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Could not pay it") }
    }
}

export const deletePayrollRunAction = async (
    id: string,
): Promise<ApiResponse<{ message: string }> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid payroll id" }

    try {
        return await deletePayrollRun(id)
    } catch (error: unknown) {
        // "That run has been paid — reverse the payouts it created" arrives here.
        return { success: false, message: getActionErrorMessage(error, "Could not discard it") }
    }
}
