"use server"

import { runValidatedAction } from "@/lib/runAction"
import { updateMe } from "@/services/auth.services"
import { updateProfileServerZodSchema } from "@/zod/auth.validation"

export const updateMeAction = async (values: unknown) =>
    runValidatedAction(updateProfileServerZodSchema, values, "Could not save your profile", updateMe)
