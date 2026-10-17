"use server"

import { requireId, runAction, runValidatedAction } from "@/lib/runAction"
import { createProjectLink, deleteProjectLink, updateProjectLink } from "@/services/project.services"
import { createProjectLinkServerZodSchema, updateProjectLinkServerZodSchema } from "@/zod/project.validation"

// "Only http and https links can be stored" and "Enter a full URL" come from
// the server and say what to fix.
export const addProjectLinkAction = async (values: unknown) =>
    runValidatedAction(createProjectLinkServerZodSchema, values, "Could not add the link", createProjectLink)

export const updateProjectLinkAction = async (id: string, values: unknown) =>
    requireId(id, "link") ??
    runValidatedAction(updateProjectLinkServerZodSchema, values, "Could not change the link", (payload) =>
        updateProjectLink(id, payload),
    )

export const removeProjectLinkAction = async (id: string) =>
    requireId(id, "link") ?? runAction("Could not remove the link", () => deleteProjectLink(id))
