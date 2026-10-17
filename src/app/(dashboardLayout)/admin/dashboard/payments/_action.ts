"use server"

import { requireId, runAction, runValidatedAction } from "@/lib/runAction"
import { createPayment, deletePayment, updatePayment } from "@/services/billing.services"
import { createPaymentServerZodSchema } from "@/zod/billing.validation"

export const createPaymentAction = async (values: unknown) =>
    runValidatedAction(createPaymentServerZodSchema, values, "Failed to record payment", createPayment)

// An edit sends every field, so the same payload schema serves both. The API
// reverses and rewrites the ledger entry when the amount, date or wallet changes.
export const updatePaymentAction = async (id: string, values: unknown) =>
    requireId(id, "payment") ??
    runValidatedAction(createPaymentServerZodSchema, values, "Failed to update payment", (payload) =>
        updatePayment(id, payload),
    )

export const deletePaymentAction = async (id: string) =>
    requireId(id, "payment") ?? runAction("Failed to delete payment", () => deletePayment(id))
