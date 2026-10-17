"use server"

import { runValidatedAction } from "@/lib/runAction"
import { forgotPassword } from "@/services/auth.services"
import { forgotPasswordServerZodSchema } from "@/zod/auth.validation"

// The server answers identically for every address and this passes that on:
// a reply that differed only for real accounts would leak what the API hides.
export const forgotPasswordAction = async (values: unknown) =>
    runValidatedAction(forgotPasswordServerZodSchema, values, "Could not send the link", forgotPassword)
