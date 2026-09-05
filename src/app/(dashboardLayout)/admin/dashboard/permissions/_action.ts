"use server"

import { getActionErrorMessage } from "@/lib/actionError"
import {
    clearUserPermission,
    setRolePermission,
    setUserPermission,
} from "@/services/permission.services"
import { setUserPermissions } from "@/services/user.services"
import type { PermissionScope } from "@/types/permission.types"
import type { IUser } from "@/types/user.types"
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types"

export const setPermissionsAction = async (
    id: string,
    permissions: string[],
): Promise<ApiResponse<IUser> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid user id" }

    try {
        return await setUserPermissions(id, permissions)
    } catch (error: unknown) {
        // "An admin already passes every check" arrives here, and already says
        // what to do instead.
        return { success: false, message: getActionErrorMessage(error, "Could not update access") }
    }
}

/**
 * The grid's three writes.
 *
 * One square at a time rather than a Save button over the whole table. A grid
 * of 168 squares saved in one go is a grid where a mistake in one corner is
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
