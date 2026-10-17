"use server"

import { requireId, runAction, runValidatedAction } from "@/lib/runAction"
import {
    approvePlatformAdmin,
    createPlatformInvite,
    removePlatformAdmin,
    revokePlatformInvite,
    setAdminPermissions,
} from "@/services/platform.services"
import { platformAccessServerZodSchema, platformInviteServerZodSchema } from "@/zod/platform.validation"

// "This is the only account that can manage the platform team" comes from the
// server and says what to do first.
export const setPermissionsAction = async (id: string, permissions: unknown) =>
    requireId(id, "operator") ??
    runValidatedAction(platformAccessServerZodSchema, permissions, "Could not update access", (granted) =>
        setAdminPermissions(id, granted),
    )

export const invitePlatformAdminAction = async (values: unknown) =>
    runValidatedAction(platformInviteServerZodSchema, values, "Could not create the invite", createPlatformInvite)

export const revokePlatformInviteAction = async (id: string) =>
    requireId(id, "invite") ?? runAction("Could not revoke the invite", () => revokePlatformInvite(id))

export const approvePlatformAdminAction = async (id: string) =>
    requireId(id, "operator") ?? runAction("Could not approve", () => approvePlatformAdmin(id))

// "This is the last active platform operator" arrives here.
export const removePlatformAdminAction = async (id: string) =>
    requireId(id, "operator") ?? runAction("Could not remove the operator", () => removePlatformAdmin(id))
