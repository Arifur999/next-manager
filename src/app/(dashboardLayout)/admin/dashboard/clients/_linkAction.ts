"use server"

import { requireId, runAction, runValidatedAction } from "@/lib/runAction"
import { createClientLink, deleteClientLink } from "@/services/crm.services"
import { createClientLinkServerZodSchema } from "@/zod/crm.validation"

// "Only http and https links can be stored" and "Enter a full URL" come from
// the server and say what to fix.
export const addClientLinkAction = async (values: unknown) =>
    runValidatedAction(createClientLinkServerZodSchema, values, "Could not add the link", createClientLink)

export const removeClientLinkAction = async (id: string) =>
    requireId(id, "link") ?? runAction("Could not remove the link", () => deleteClientLink(id))
