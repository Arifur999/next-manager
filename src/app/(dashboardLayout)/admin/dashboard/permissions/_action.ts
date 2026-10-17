"use server"

import { requireId, runValidatedAction } from "@/lib/runAction"
import { clearUserPermission, setRolePermission, setUserPermission } from "@/services/permission.services"
import {
    permissionCellServerZodSchema,
    rolePermissionServerZodSchema,
    userPermissionServerZodSchema,
} from "@/zod/permission.validation"

// One square per write rather than a Save over the grid, so a mistake in one
// corner never hides among changes elsewhere and two admins do not overwrite
// each other.
export const setRolePermissionAction = async (values: unknown) =>
    runValidatedAction(rolePermissionServerZodSchema, values, "Could not change that permission", setRolePermission)

export const setUserPermissionAction = async (userId: string, values: unknown) =>
    requireId(userId, "user") ??
    runValidatedAction(userPermissionServerZodSchema, values, "Could not set that override", (payload) =>
        setUserPermission(userId, payload),
    )

export const clearUserPermissionAction = async (userId: string, module: string, action: string) =>
    requireId(userId, "user") ??
    runValidatedAction(permissionCellServerZodSchema, { module, action }, "Could not clear that override", (cell) =>
        clearUserPermission(userId, cell.module, cell.action),
    )
