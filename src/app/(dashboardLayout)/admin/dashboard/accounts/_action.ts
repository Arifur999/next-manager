"use server"

import { requireId, runAction, runValidatedAction } from "@/lib/runAction"
import { createAccount, deleteAccount } from "@/services/finance.services"
import { createAccountServerZodSchema } from "@/zod/finance.validation"

export const createAccountAction = async (values: unknown) =>
    runValidatedAction(createAccountServerZodSchema, values, "Failed to create account", createAccount)

export const deleteAccountAction = async (id: string) =>
    requireId(id, "account") ?? runAction("Failed to delete account", () => deleteAccount(id))
