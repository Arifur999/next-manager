"use server"

import { getActionErrorMessage } from "@/lib/actionError"
import {
    clearUserPermission,
    setRolePermission,
    setUserPermission,
} from "@/services/permission.services"
import type { PermissionScope } from "@/types/permission.types"

/**
 * The grid's three writes.
 *
 * One square at a time rather than a Save button over the whole table. A grid
 * of 200 squares saved in one go is a grid where a mistake in one corner is
 * indistinguishable from a deliberate change in another, and where two admins
 * editing at once silently overwrite each other.
 */
export const setRolePermissionAction = async (payload: {
    role: string
    module: string
    action: string
    scope: PermissionScope
}) => {
    try {
        return await setRolePermission(payload)
    } catch (error: unknown) {
        return {
            success: false as const,
            message: getActionErrorMessage(error, "Could not change that permission"),
        }
    }
}

export const setUserPermissionAction = async (
    userId: string,
    payload: { module: string; action: string; scope: PermissionScope },
) => {
    if (!userId) return { success: false as const, message: "Invalid user id" }

    try {
        return await setUserPermission(userId, payload)
    } catch (error: unknown) {
        return {
            success: false as const,
            message: getActionErrorMessage(error, "Could not set that override"),
        }
    }
}

export const clearUserPermissionAction = async (
    userId: string,
    module: string,
    action: string,
) => {
    if (!userId) return { success: false as const, message: "Invalid user id" }

    try {
        return await clearUserPermission(userId, module, action)
    } catch (error: unknown) {
        return {
            success: false as const,
            message: getActionErrorMessage(error, "Could not clear that override"),
        }
    }
}
