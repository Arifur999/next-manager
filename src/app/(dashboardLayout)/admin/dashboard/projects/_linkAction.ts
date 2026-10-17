"use server"

import { requireId, runAction, runValidatedAction } from "@/lib/runAction"
import { createProjectLink, deleteProjectLink } from "@/services/project.services"
import { createProjectLinkServerZodSchema } from "@/zod/project.validation"

// "Only http and https links can be stored" and "Enter a full URL" come from
// the server and say what to fix.
export const addProjectLinkAction = async (values: unknown) =>
    runValidatedAction(createProjectLinkServerZodSchema, values, "Could not add the link", createProjectLink)

export const removeProjectLinkAction = async (id: string) =>
    requireId(id, "link") ?? runAction("Could not remove the link", () => deleteProjectLink(id))
