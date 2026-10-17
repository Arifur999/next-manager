"use server"

import { runValidatedAction } from "@/lib/runAction"
import { signIn } from "@/services/auth.services"
import { loginServerZodSchema } from "@/zod/auth.validation"

export const loginAction = async (values: unknown) =>
    runValidatedAction(loginServerZodSchema, values, "Failed to sign in", signIn)
