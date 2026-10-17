"use server"

import { requireId, runAction, runValidatedAction } from "@/lib/runAction"
import {
    createCredential,
    deleteCredential,
    getCredentialAccessLog,
    revealCredential,
    updateCredential,
} from "@/services/workspace.services"
import { createCredentialServerZodSchema, updateCredentialServerZodSchema } from "@/zod/workspace.validation"

export const createCredentialAction = async (values: unknown) =>
    runValidatedAction(createCredentialServerZodSchema, values, "Failed to save credential", createCredential)

export const updateCredentialAction = async (id: string, values: unknown) =>
    requireId(id, "credential") ??
    runValidatedAction(updateCredentialServerZodSchema, values, "Failed to update credential", (payload) =>
        updateCredential(id, payload),
    )

export const deleteCredentialAction = async (id: string) =>
    requireId(id, "credential") ?? runAction("Failed to delete credential", () => deleteCredential(id))

// The only path that returns a real password, and the server logs every call:
// it runs when somebody asks to see the secret, never as part of loading a page.
export const revealCredentialAction = async (id: string) =>
    requireId(id, "credential") ?? runAction("Failed to reveal credential", () => revealCredential(id))

export const getAccessLogAction = async (id: string) =>
    requireId(id, "credential") ?? runAction("Failed to load access log", () => getCredentialAccessLog(id))
