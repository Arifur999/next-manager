"use server"

import { requireId, runValidatedAction } from "@/lib/runAction"
import { acceptPlatformInvite } from "@/services/auth.services"
import { joinServerZodSchema } from "@/zod/auth.validation"

// No email in the payload: it comes from the invite, because a platform account
// under somebody else's address could suspend every customer.
export const acceptPlatformInviteAction = async (token: string, values: unknown) =>
    requireId(token, "invite") ??
    runValidatedAction(joinServerZodSchema, values, "Could not complete your request", (payload) =>
        acceptPlatformInvite(token, payload),
    )
