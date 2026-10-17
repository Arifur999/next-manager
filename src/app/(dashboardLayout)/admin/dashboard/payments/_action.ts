"use server"

import { requireId, runAction, runValidatedAction } from "@/lib/runAction"
import { createPayment, deletePayment } from "@/services/billing.services"
import { createPaymentServerZodSchema } from "@/zod/billing.validation"

export const createPaymentAction = async (values: unknown) =>
    runValidatedAction(createPaymentServerZodSchema, values, "Failed to record payment", createPayment)

export const deletePaymentAction = async (id: string) =>
    requireId(id, "payment") ?? runAction("Failed to delete payment", () => deletePayment(id))
