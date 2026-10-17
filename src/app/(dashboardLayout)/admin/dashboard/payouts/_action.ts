"use server"

import { requireId, runAction, runValidatedAction } from "@/lib/runAction"
import { createTeamPayout, deleteTeamPayout, updateTeamPayout } from "@/services/spending.services"
import { createTeamPayoutServerZodSchema } from "@/zod/spending.validation"

export const createTeamPayoutAction = async (values: unknown) =>
    runValidatedAction(createTeamPayoutServerZodSchema, values, "Failed to record payout", createTeamPayout)

// An edit sends every field, so the create payload schema serves it too.
export const updateTeamPayoutAction = async (id: string, values: unknown) =>
    requireId(id, "payout") ??
    runValidatedAction(createTeamPayoutServerZodSchema, values, "Failed to update payout", (payload) =>
        updateTeamPayout(id, payload),
    )

export const deleteTeamPayoutAction = async (id: string) =>
    requireId(id, "payout") ?? runAction("Failed to delete payout", () => deleteTeamPayout(id))
