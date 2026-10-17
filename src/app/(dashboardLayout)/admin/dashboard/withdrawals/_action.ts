"use server"

import { requireId, runAction, runValidatedAction } from "@/lib/runAction"
import { createOwnerWithdrawal, deleteOwnerWithdrawal, updateOwnerWithdrawal } from "@/services/spending.services"
import { createOwnerWithdrawalServerZodSchema } from "@/zod/spending.validation"

export const createWithdrawalAction = async (values: unknown) =>
    runValidatedAction(createOwnerWithdrawalServerZodSchema, values, "Failed to record withdrawal", createOwnerWithdrawal)

// An edit sends every field, so the create payload schema serves it too.
export const updateWithdrawalAction = async (id: string, values: unknown) =>
    requireId(id, "withdrawal") ??
    runValidatedAction(createOwnerWithdrawalServerZodSchema, values, "Failed to update withdrawal", (payload) =>
        updateOwnerWithdrawal(id, payload),
    )

export const deleteWithdrawalAction = async (id: string) =>
    requireId(id, "withdrawal") ?? runAction("Failed to delete withdrawal", () => deleteOwnerWithdrawal(id))
