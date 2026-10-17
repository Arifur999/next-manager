"use server"

import { requireId, runAction, runValidatedAction } from "@/lib/runAction"
import { createAgencyInvite, revokeAgencyInvite } from "@/services/platform.services"
import { agencyInviteServerZodSchema } from "@/zod/platform.validation"

// "One address cannot own two agencies" is the server's wording.
export const inviteAgencyAction = async (values: unknown) =>
    runValidatedAction(agencyInviteServerZodSchema, values, "Could not send the invite", createAgencyInvite)

export const revokeAgencyInviteAction = async (id: string) =>
    requireId(id, "invite") ?? runAction("Could not revoke the invite", () => revokeAgencyInvite(id))
