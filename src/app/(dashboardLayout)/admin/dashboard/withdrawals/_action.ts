"use server"

import { requireId, runAction, runValidatedAction } from "@/lib/runAction"
import { createOwnerWithdrawal, deleteOwnerWithdrawal } from "@/services/spending.services"
import { createOwnerWithdrawalServerZodSchema } from "@/zod/spending.validation"

export const createWithdrawalAction = async (values: unknown) =>
    runValidatedAction(createOwnerWithdrawalServerZodSchema, values, "Failed to record withdrawal", createOwnerWithdrawal)

export const deleteWithdrawalAction = async (id: string) =>
    requireId(id, "withdrawal") ?? runAction("Failed to delete withdrawal", () => deleteOwnerWithdrawal(id))
