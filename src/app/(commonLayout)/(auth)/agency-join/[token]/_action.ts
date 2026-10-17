"use server"

import { requireId, runValidatedAction } from "@/lib/runAction"
import { acceptAgencyInvite } from "@/services/auth.services"
import { agencyJoinServerZodSchema } from "@/zod/auth.validation"

// No session is set: the owner signs in once with the password just chosen,
// which is the thing they will do every morning.
export const acceptAgencyInviteAction = async (token: string, values: unknown) =>
    requireId(token, "invite") ??
    runValidatedAction(agencyJoinServerZodSchema, values, "Could not complete your request", (payload) =>
        acceptAgencyInvite(token, payload),
    )
