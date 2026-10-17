"use server"

import { requireId, runAction, runValidatedAction } from "@/lib/runAction"
import { createInvoice, deleteInvoice } from "@/services/billing.services"
import { createInvoiceServerZodSchema } from "@/zod/billing.validation"

export const createInvoiceAction = async (values: unknown) =>
    runValidatedAction(createInvoiceServerZodSchema, values, "Failed to create invoice", createInvoice)

export const deleteInvoiceAction = async (id: string) =>
    requireId(id, "invoice") ?? runAction("Failed to delete invoice", () => deleteInvoice(id))
