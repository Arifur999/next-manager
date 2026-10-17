"use server"

import { requireId, runAction, runValidatedAction } from "@/lib/runAction"
import { cancelLeave, decideLeave, requestLeave } from "@/services/people.services"
import { leaveDecisionServerZodSchema, requestLeaveServerZodSchema } from "@/zod/people.validation"

// "You already have approved leave covering those dates" is the server's
// refusal, and already says what to do about it.
export const requestLeaveAction = async (values: unknown) =>
    runValidatedAction(requestLeaveServerZodSchema, values, "Could not send it", requestLeave)

export const cancelLeaveAction = async (id: string) =>
    requireId(id, "request") ?? runAction("Could not withdraw it", () => cancelLeave(id))

// Nobody decides their own leave, and the server refuses it by name.
export const decideLeaveAction = async (id: string, values: unknown) =>
    requireId(id, "request") ??
    runValidatedAction(leaveDecisionServerZodSchema, values, "Could not decide it", (payload) =>
        decideLeave(id, payload),
    )
