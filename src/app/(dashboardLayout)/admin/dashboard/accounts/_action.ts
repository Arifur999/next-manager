"use server"

import { requireId, runAction, runValidatedAction } from "@/lib/runAction"
import { createAccount, deleteAccount, updateAccount } from "@/services/finance.services"
import { accountRenameFormZodSchema, createAccountServerZodSchema } from "@/zod/finance.validation"
import { activeStateServerZodSchema } from "@/zod/formFields"

export const createAccountAction = async (values: unknown) =>
    runValidatedAction(createAccountServerZodSchema, values, "Failed to create account", createAccount)

// Both edits need the accounts "edit" permission; a refusal names it.
export const renameAccountAction = async (id: string, values: unknown) =>
    requireId(id, "account") ??
    runValidatedAction(accountRenameFormZodSchema, values, "Failed to rename account", (payload) =>
        updateAccount(id, payload),
    )

// An account with history cannot be deleted, so this is how it leaves the pickers.
export const setAccountActiveAction = async (id: string, values: unknown) =>
    requireId(id, "account") ??
    runValidatedAction(activeStateServerZodSchema, values, "Failed to update account", (payload) =>
        updateAccount(id, payload),
    )

export const deleteAccountAction = async (id: string) =>
    requireId(id, "account") ?? runAction("Failed to delete account", () => deleteAccount(id))
