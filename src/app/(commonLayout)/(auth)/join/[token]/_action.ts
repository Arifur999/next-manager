"use server"

import { requireId, runValidatedAction } from "@/lib/runAction"
import { acceptInvite } from "@/services/auth.services"
import { joinServerZodSchema } from "@/zod/auth.validation"

export const acceptInviteAction = async (token: string, values: unknown) =>
    requireId(token, "invite") ??
    runValidatedAction(joinServerZodSchema, values, "Could not complete your request", (payload) =>
        acceptInvite(token, payload),
    )
