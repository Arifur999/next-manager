"use server"

import { requireId, runAction, runValidatedAction } from "@/lib/runAction"
import { createWorkflowStatus, deleteWorkflowStatus, updateWorkflowStatus } from "@/services/work.services"
import { createWorkflowStatusServerZodSchema, updateWorkflowStatusServerZodSchema } from "@/zod/work.validation"

export const createWorkflowStatusAction = async (values: unknown) =>
    runValidatedAction(createWorkflowStatusServerZodSchema, values, "Could not add it", createWorkflowStatus)

export const updateWorkflowStatusAction = async (id: string, values: unknown) =>
    requireId(id, "status") ??
    runValidatedAction(updateWorkflowStatusServerZodSchema, values, "Could not change it", (payload) =>
        updateWorkflowStatus(id, payload),
    )

// "4 tasks are on In QA. Move them first, or turn it off instead of deleting
// it." comes from the server and already says what to do.
export const deleteWorkflowStatusAction = async (id: string) =>
    requireId(id, "status") ?? runAction("Could not remove it", () => deleteWorkflowStatus(id))
