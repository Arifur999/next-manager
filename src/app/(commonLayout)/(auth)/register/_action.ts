"use server"

import { runValidatedAction } from "@/lib/runAction"
import { register } from "@/services/auth.services"
import { registerServerZodSchema } from "@/zod/auth.validation"

// "An account with this email already exists" is the server's own wording.
export const registerAction = async (values: unknown) =>
    runValidatedAction(registerServerZodSchema, values, "Could not create your workspace", register)
