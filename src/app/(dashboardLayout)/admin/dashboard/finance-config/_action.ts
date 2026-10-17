"use server"

import { requireId, runAction, runValidatedAction } from "@/lib/runAction"
import { refreshRate, setDefaultRate } from "@/services/finance.services"
import { createExpenseCategory, deleteExpenseCategory } from "@/services/spending.services"
import { setDefaultRateServerZodSchema } from "@/zod/finance.validation"
import { createExpenseCategoryServerZodSchema } from "@/zod/spending.validation"

// The API range-checks the rate (a typo like 1180 would inflate every reported
// figure tenfold), and its refusal says so.
export const setDefaultRateAction = async (values: unknown) =>
    runValidatedAction(setDefaultRateServerZodSchema, values, "Failed to set the rate", (payload) =>
        setDefaultRate(payload.default_usd_rate),
    )

export const refreshRateAction = async () => runAction("Failed to refresh the rate", () => refreshRate())

export const createCategoryAction = async (values: unknown) =>
    runValidatedAction(createExpenseCategoryServerZodSchema, values, "Failed to create the category", createExpenseCategory)

export const deleteCategoryAction = async (id: string) =>
    requireId(id, "category") ?? runAction("Failed to delete the category", () => deleteExpenseCategory(id))
