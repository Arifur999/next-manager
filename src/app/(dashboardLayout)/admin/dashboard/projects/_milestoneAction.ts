"use server"

import { requireId, runAction, runValidatedAction } from "@/lib/runAction"
import {
    acceptMilestone,
    createMilestone,
    deleteMilestone,
    reopenMilestone,
    setProjectBaseline,
    submitMilestone,
} from "@/services/project.services"
import { createMilestoneServerZodSchema, setBaselineServerZodSchema } from "@/zod/project.validation"

export const createMilestoneAction = async (values: unknown) =>
    runValidatedAction(createMilestoneServerZodSchema, values, "Failed to add the milestone", createMilestone)

export const submitMilestoneAction = async (id: string) =>
    requireId(id, "milestone") ?? runAction("Failed to submit", () => submitMilestone(id))

export const acceptMilestoneAction = async (id: string) =>
    requireId(id, "milestone") ?? runAction("Failed to accept", () => acceptMilestone(id))

export const reopenMilestoneAction = async (id: string) =>
    requireId(id, "milestone") ?? runAction("Failed to reopen", () => reopenMilestone(id))

export const deleteMilestoneAction = async (id: string) =>
    requireId(id, "milestone") ?? runAction("Failed to delete", () => deleteMilestone(id))

// The 409 on a second baseline explains what replacing it costs. That sentence
// is the whole safeguard, so it reaches the toast intact.
export const setBaselineAction = async (projectId: string, values: unknown) =>
    requireId(projectId, "project") ??
    runValidatedAction(setBaselineServerZodSchema, values, "Failed to set the baseline", (payload) =>
        setProjectBaseline(projectId, payload),
    )
