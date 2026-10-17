"use server"

import { requireId, runAction, runValidatedAction } from "@/lib/runAction"
import { createCredential, getCredentialAccessLog, revealCredential } from "@/services/workspace.services"
import { createCredentialServerZodSchema } from "@/zod/workspace.validation"

export const createCredentialAction = async (values: unknown) =>
    runValidatedAction(createCredentialServerZodSchema, values, "Failed to save credential", createCredential)

// The only path that returns a real password, and the server logs every call:
// it runs when somebody asks to see the secret, never as part of loading a page.
export const revealCredentialAction = async (id: string) =>
    requireId(id, "credential") ?? runAction("Failed to reveal credential", () => revealCredential(id))

export const getAccessLogAction = async (id: string) =>
    requireId(id, "credential") ?? runAction("Failed to load access log", () => getCredentialAccessLog(id))
