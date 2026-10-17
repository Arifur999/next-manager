"use server"

import { requireId, runValidatedAction } from "@/lib/runAction"
import { setNotificationRule } from "@/services/workspace.services"
import { notificationRuleServerZodSchema } from "@/zod/workspace.validation"

// An event nothing fires is refused by the server, which says so, rather than
// stored as a setting that could never take effect.
export const setNotificationRuleAction = async (event: string, values: unknown) =>
    requireId(event, "event") ??
    runValidatedAction(notificationRuleServerZodSchema, values, "Could not save that", (payload) =>
        setNotificationRule(event, payload),
    )
