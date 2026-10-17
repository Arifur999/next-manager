"use server"

import { requireId, runAction, runValidatedAction } from "@/lib/runAction"
import { createInvoice, deleteInvoice, updateInvoice } from "@/services/billing.services"
import { createInvoiceServerZodSchema, updateInvoiceServerZodSchema } from "@/zod/billing.validation"

export const createInvoiceAction = async (values: unknown) =>
    runValidatedAction(createInvoiceServerZodSchema, values, "Failed to create invoice", createInvoice)

export const updateInvoiceAction = async (id: string, values: unknown) =>
    requireId(id, "invoice") ??
    runValidatedAction(updateInvoiceServerZodSchema, values, "Failed to update invoice", (payload) =>
        updateInvoice(id, payload),
    )

// Cancelled is never derived from payments, so it stays: the invoice stops
// counting as owed and the record of having sent it remains.
export const cancelInvoiceAction = async (id: string) =>
    requireId(id, "invoice") ?? runAction("Failed to cancel invoice", () => updateInvoice(id, { status: "cancelled" }))

export const deleteInvoiceAction = async (id: string) =>
    requireId(id, "invoice") ?? runAction("Failed to delete invoice", () => deleteInvoice(id))
