"use server"

import { requireId, runValidatedAction } from "@/lib/runAction"
import { setCapacity } from "@/services/work.services"
import { capacityServerZodSchema } from "@/zod/people.validation"

// More than 80 hours a week is refused by name: it is almost always a typo.
export const setCapacityAction = async (userId: string, values: unknown) =>
    requireId(userId, "user") ??
    runValidatedAction(capacityServerZodSchema, values, "Failed to save capacity", (payload) =>
        setCapacity(userId, payload),
    )
