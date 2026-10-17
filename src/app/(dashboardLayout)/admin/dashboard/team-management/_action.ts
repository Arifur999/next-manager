"use server"

import { requireId, runAction, runValidatedAction } from "@/lib/runAction"
import { createUser, deleteUser, updateUser } from "@/services/user.services"
import { createUserServerZodSchema, updateUserServerZodSchema } from "@/zod/user.validation"

// "An account with this email already exists" and the last-admin guard are
// the server's words, and are shown as they are.
export const createUserAction = async (values: unknown) =>
  runValidatedAction(createUserServerZodSchema, values, "Failed to create team member", createUser)

export const updateUserAction = async (id: string, values: unknown) =>
  requireId(id, "user") ??
  runValidatedAction(updateUserServerZodSchema, values, "Failed to update team member", (payload) =>
    updateUser(id, payload),
  )

export const deleteUserAction = async (id: string) =>
  requireId(id, "user") ?? runAction("Failed to delete team member", () => deleteUser(id))
