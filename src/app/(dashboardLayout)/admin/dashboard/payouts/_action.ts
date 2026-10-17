"use server"

import { requireId, runAction, runValidatedAction } from "@/lib/runAction"
import { createTeamPayout, deleteTeamPayout } from "@/services/spending.services"
import { createTeamPayoutServerZodSchema } from "@/zod/spending.validation"

export const createTeamPayoutAction = async (values: unknown) =>
    runValidatedAction(createTeamPayoutServerZodSchema, values, "Failed to record payout", createTeamPayout)

export const deleteTeamPayoutAction = async (id: string) =>
    requireId(id, "payout") ?? runAction("Failed to delete payout", () => deleteTeamPayout(id))
