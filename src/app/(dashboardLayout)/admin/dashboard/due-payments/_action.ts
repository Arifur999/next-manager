"use server"

import { requireId, runAction, runValidatedAction } from "@/lib/runAction"
import { createDuePerson, createDueTransaction, deleteDueTransaction } from "@/services/spending.services"
import { createDuePersonServerZodSchema, createDueTransactionServerZodSchema } from "@/zod/spending.validation"

export const createDuePersonAction = async (values: unknown) =>
    runValidatedAction(createDuePersonServerZodSchema, values, "Failed to add person", createDuePerson)

export const createDueTransactionAction = async (values: unknown) =>
    runValidatedAction(createDueTransactionServerZodSchema, values, "Failed to record transaction", createDueTransaction)

export const deleteDueTransactionAction = async (id: string) =>
    requireId(id, "transaction") ?? runAction("Failed to delete transaction", () => deleteDueTransaction(id))
