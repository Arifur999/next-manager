"use server"

import { runValidatedAction } from "@/lib/runAction"
import { resetPassword } from "@/services/auth.services"
import { resetPasswordServerZodSchema } from "@/zod/auth.validation"

// "That reset link is no longer valid. Ask for a new one." is the server's wording.
export const resetPasswordAction = async (values: unknown) =>
    runValidatedAction(resetPasswordServerZodSchema, values, "Could not reset your password", resetPassword)
