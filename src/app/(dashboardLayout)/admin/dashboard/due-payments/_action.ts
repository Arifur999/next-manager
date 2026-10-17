"use server"

import { requireId, runAction, runValidatedAction } from "@/lib/runAction"
import {
    createDuePerson,
    createDueTransaction,
    deleteDuePerson,
    deleteDueTransaction,
    updateDuePerson,
} from "@/services/spending.services"
import { createDuePersonServerZodSchema, createDueTransactionServerZodSchema } from "@/zod/spending.validation"

export const createDuePersonAction = async (values: unknown) =>
    runValidatedAction(createDuePersonServerZodSchema, values, "Failed to add person", createDuePerson)

export const updateDuePersonAction = async (id: string, values: unknown) =>
    requireId(id, "person") ??
    runValidatedAction(createDuePersonServerZodSchema, values, "Failed to update person", (payload) =>
        updateDuePerson(id, payload),
    )

// The API refuses a person with recorded transactions, and its message says so.
export const deleteDuePersonAction = async (id: string) =>
    requireId(id, "person") ?? runAction("Failed to delete person", () => deleteDuePerson(id))

export const createDueTransactionAction = async (values: unknown) =>
    runValidatedAction(createDueTransactionServerZodSchema, values, "Failed to record transaction", createDueTransaction)

export const deleteDueTransactionAction = async (id: string) =>
    requireId(id, "transaction") ?? runAction("Failed to delete transaction", () => deleteDueTransaction(id))
