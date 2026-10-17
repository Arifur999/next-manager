"use server"

import { requireId, runAction, runValidatedAction } from "@/lib/runAction"
import { createPlatformExpense, deletePlatformExpense } from "@/services/platform.services"
import { platformExpenseServerZodSchema } from "@/zod/platform.validation"

// The permission refusal comes from the server and says what to change.
export const addPlatformExpenseAction = async (values: unknown) =>
    runValidatedAction(platformExpenseServerZodSchema, values, "Could not record the expense", createPlatformExpense)

export const removePlatformExpenseAction = async (id: string) =>
    requireId(id, "expense") ?? runAction("Could not remove the expense", () => deletePlatformExpense(id))
