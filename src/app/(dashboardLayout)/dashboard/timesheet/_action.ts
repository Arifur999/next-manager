"use server"

import { requireId, runAction, runValidatedAction } from "@/lib/runAction"
import {
    approveTimeEntry,
    createTimeEntry,
    deleteTimeEntry,
    unapproveTimeEntry,
    updateTimeEntry,
} from "@/services/work.services"
import { logTimeServerZodSchema } from "@/zod/work.validation"

// The server names a misplaced decimal point and a task from the wrong
// project; those messages say more than a generic failure, so they come
// straight through.
export const logTimeAction = async (values: unknown) =>
    runValidatedAction(logTimeServerZodSchema, values, "Failed to log time", createTimeEntry)

// An approved entry is refused with "Un-approve it first", which comes through as is.
export const updateTimeAction = async (id: string, values: unknown) =>
    requireId(id, "entry") ??
    runValidatedAction(logTimeServerZodSchema, values, "Failed to save time", (payload) => updateTimeEntry(id, payload))

export const deleteTimeAction = async (id: string) =>
    requireId(id, "entry") ?? runAction("Failed to delete time", () => deleteTimeEntry(id))

export const approveTimeAction = async (id: string) =>
    requireId(id, "entry") ?? runAction("Failed to approve", () => approveTimeEntry(id))

export const unapproveTimeAction = async (id: string) =>
    requireId(id, "entry") ?? runAction("Failed to remove approval", () => unapproveTimeEntry(id))
