"use server"

import { getDefaultDashboardRoute, type UserRole } from "@/lib/authUtils"
import { errorFields, logger } from "@/lib/logger"
import { runValidatedAction } from "@/lib/runAction"
import { register, signIn } from "@/services/auth.services"
import type { ApiResponse } from "@/types/api.types"
import { toUserRole } from "@/types/user.types"
import { registerServerZodSchema, type ILoginFormValues, type IRegisterPayload } from "@/zod/auth.validation"

/** Where the new admin goes next: their dashboard, or /login with the email filled in. */
export interface IRegisterOutcome {
    destination: string
}

// The workspace exists once register succeeds, so a sign-in that fails after it
// must not read as a failed registration: a retry would only hit "already exists".
const signInNewAdmin = async (credentials: ILoginFormValues): Promise<UserRole | null> => {
    try {
        const session = await signIn(credentials)
        return session.success ? toUserRole(session.data?.user.role) : null
    } catch (error) {
        logger.warn("Sign-in after registration failed", errorFields(error))
        return null
    }
}

const createWorkspace = async (payload: IRegisterPayload): Promise<ApiResponse<IRegisterOutcome | null>> => {
    const created = await register(payload)
    if (!created.success) return { success: false, message: created.message, data: null }

    const role = await signInNewAdmin({ email: payload.email, password: payload.password })
    if (!role) {
        const destination = `/login?email=${encodeURIComponent(payload.email)}`
        return { success: true, message: "Workspace created. Sign in to open it.", data: { destination } }
    }

    return { success: true, message: "Workspace created", data: { destination: getDefaultDashboardRoute(role) } }
}

// "An account with this email already exists" is the server's own wording.
export const registerAction = async (values: unknown) =>
    runValidatedAction(registerServerZodSchema, values, "Could not create your workspace", createWorkspace)
