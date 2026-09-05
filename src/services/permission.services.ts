"use server"

import { httpClient } from "@/lib/axios/httpClient"
import type { IPermissionGrid, PermissionScope } from "@/types/permission.types"

/**
 * The whole grid in one read.
 *
 * Deliberately not three calls. The catalogue, the role rows and one person's
 * overrides are drawn as a single table, and fetching them separately would be
 * three chances to draw a mixture of two moments.
 */
export const getPermissionGrid = async (userId?: string) => {
    try {
        return await httpClient.get<IPermissionGrid>("/permissions", {
            params: userId ? { user_id: userId } : undefined,
        })
    } catch (error) {
        console.log("Error fetching permissions:", error)
        throw error
    }
}

export const setRolePermission = async (payload: {
    role: string
    module: string
    action: string
    scope: PermissionScope
}) => {
    return await httpClient.patch("/permissions/roles", payload)
}

export const setUserPermission = async (
    userId: string,
    payload: { module: string; action: string; scope: PermissionScope },
) => {
    return await httpClient.patch(`/permissions/users/${userId}`, payload)
}

/** Removes the override rather than writing the role's value into it. */
export const clearUserPermission = async (userId: string, module: string, action: string) => {
    return await httpClient.delete(`/permissions/users/${userId}/${module}/${action}`)
}
