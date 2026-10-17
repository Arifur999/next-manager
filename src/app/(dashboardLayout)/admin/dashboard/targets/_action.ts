"use server"

import { requireId, runAction, runValidatedAction } from "@/lib/runAction"
import { createKpiTarget, deleteKpiTarget, updateKpiTarget } from "@/services/insights.services"
import { setKpiTargetServerZodSchema, updateKpiTargetServerZodSchema } from "@/zod/insights.validation"

// The API names the problem (a percentage above 100, a quarter that does not
// start in a quarter month, a target that already exists for the period), so
// its message is what the toast shows.
export const setTargetAction = async (values: unknown) =>
    runValidatedAction(setKpiTargetServerZodSchema, values, "Failed to set the target", createKpiTarget)

export const updateTargetAction = async (id: string, values: unknown) =>
    requireId(id, "target") ??
    runValidatedAction(updateKpiTargetServerZodSchema, values, "Failed to change the target", (payload) =>
        updateKpiTarget(id, payload),
    )

export const deleteTargetAction = async (id: string) =>
    requireId(id, "target") ?? runAction("Failed to delete the target", () => deleteKpiTarget(id))
