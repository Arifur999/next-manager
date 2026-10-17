"use server"

import { requireId, runAction, runValidatedAction } from "@/lib/runAction"
import {
    createLoan,
    deleteLoan,
    payLoanInstalment,
    reverseLoanInstalment,
    updateLoan,
} from "@/services/finance.services"
import { createLoanServerZodSchema, payInstalmentServerZodSchema } from "@/zod/finance.validation"

// The API's refusals are specific ("already paid", "has repayments, close it
// instead", a USD account named for a BDT loan), so they reach the toast as sent.

export const createLoanAction = async (values: unknown) =>
    runValidatedAction(createLoanServerZodSchema, values, "Could not record it", createLoan)

// Closing is the only change a screen makes to a loan: settled is what the last
// payment does on its own.
export const closeLoanAction = async (id: string) =>
    requireId(id, "loan") ?? runAction("Could not close it", () => updateLoan(id, { status: "closed" }))

export const payLoanInstalmentAction = async (instalmentId: string, values: unknown) =>
    requireId(instalmentId, "instalment") ??
    runValidatedAction(payInstalmentServerZodSchema, values, "Could not pay it", (payload) =>
        payLoanInstalment(instalmentId, payload),
    )

export const reverseLoanInstalmentAction = async (instalmentId: string) =>
    requireId(instalmentId, "instalment") ??
    runAction("Could not reverse it", () => reverseLoanInstalment(instalmentId))

export const deleteLoanAction = async (id: string) =>
    requireId(id, "loan") ?? runAction("Could not delete it", () => deleteLoan(id))
