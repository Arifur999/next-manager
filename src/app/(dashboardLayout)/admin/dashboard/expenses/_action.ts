"use server"

import { requireId, runAction, runValidatedAction } from "@/lib/runAction"
import {
    createExpense,
    createExpenseCategory,
    deleteExpense,
    deleteExpenseCategory,
    updateExpense,
} from "@/services/spending.services"
import { createExpenseCategoryServerZodSchema, createExpenseServerZodSchema } from "@/zod/spending.validation"

export const createExpenseAction = async (values: unknown) =>
    runValidatedAction(createExpenseServerZodSchema, values, "Failed to record expense", createExpense)

// An edit sends every field, so the create payload schema serves it too.
export const updateExpenseAction = async (id: string, values: unknown) =>
    requireId(id, "expense") ??
    runValidatedAction(createExpenseServerZodSchema, values, "Failed to update expense", (payload) =>
        updateExpense(id, payload),
    )

export const deleteExpenseAction = async (id: string) =>
    requireId(id, "expense") ?? runAction("Failed to delete expense", () => deleteExpense(id))

export const createExpenseCategoryAction = async (values: unknown) =>
    runValidatedAction(createExpenseCategoryServerZodSchema, values, "Failed to create category", createExpenseCategory)

export const deleteExpenseCategoryAction = async (id: string) =>
    requireId(id, "category") ?? runAction("Failed to delete category", () => deleteExpenseCategory(id))
