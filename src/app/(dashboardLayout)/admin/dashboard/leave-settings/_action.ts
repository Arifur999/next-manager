"use server"

import { requireId, runValidatedAction } from "@/lib/runAction"
import { createLeaveType, updateLeaveType } from "@/services/people.services"
import { activeStateServerZodSchema, leaveTypeServerZodSchema } from "@/zod/people.validation"

// Names are unique case-insensitively, so "annual leave" is refused while
// "Annual leave" exists, and the server's message says so.
export const createLeaveTypeAction = async (values: unknown) =>
    runValidatedAction(leaveTypeServerZodSchema, values, "Could not add it", createLeaveType)

export const setLeaveTypeActiveAction = async (id: string, values: unknown) =>
    requireId(id, "leave type") ??
    runValidatedAction(activeStateServerZodSchema, values, "Could not update it", (payload) =>
        updateLeaveType(id, payload),
    )
