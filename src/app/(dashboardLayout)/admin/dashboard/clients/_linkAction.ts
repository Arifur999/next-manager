"use server"

import { requireId, runAction, runValidatedAction } from "@/lib/runAction"
import { createClientLink, deleteClientLink, updateClientLink } from "@/services/crm.services"
import { createClientLinkServerZodSchema, updateClientLinkServerZodSchema } from "@/zod/crm.validation"

// "Only http and https links can be stored" and "Enter a full URL" come from
// the server and say what to fix.
export const addClientLinkAction = async (values: unknown) =>
    runValidatedAction(createClientLinkServerZodSchema, values, "Could not add the link", createClientLink)

export const updateClientLinkAction = async (id: string, values: unknown) =>
    requireId(id, "link") ??
    runValidatedAction(updateClientLinkServerZodSchema, values, "Could not change the link", (payload) =>
        updateClientLink(id, payload),
    )

export const removeClientLinkAction = async (id: string) =>
    requireId(id, "link") ?? runAction("Could not remove the link", () => deleteClientLink(id))
