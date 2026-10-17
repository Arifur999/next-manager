"use server"

import { requireId, runAction, runValidatedAction } from "@/lib/runAction"
import { approveTimeEntry, createTimeEntry, unapproveTimeEntry } from "@/services/work.services"
import { logTimeServerZodSchema } from "@/zod/work.validation"

// The server names a misplaced decimal point and a task from the wrong
// project; those messages say more than a generic failure, so they come
// straight through.
export const logTimeAction = async (values: unknown) =>
    runValidatedAction(logTimeServerZodSchema, values, "Failed to log time", createTimeEntry)

export const approveTimeAction = async (id: string) =>
    requireId(id, "entry") ?? runAction("Failed to approve", () => approveTimeEntry(id))

export const unapproveTimeAction = async (id: string) =>
    requireId(id, "entry") ?? runAction("Failed to remove approval", () => unapproveTimeEntry(id))
