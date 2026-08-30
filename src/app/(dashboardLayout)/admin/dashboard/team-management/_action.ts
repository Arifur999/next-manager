"use server"

import { createUser, deleteUser, updateUser } from "@/services/user.services"
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types"
import { type IUser } from "@/types/user.types"

// Digs the backend's own message out of an axios error, so the user reads
// "An account with this email already exists" rather than
// "Request failed with status code 409".
const getActionErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "data" in error.response &&
    error.response.data &&
    typeof error.response.data === "object" &&
    "message" in error.response.data &&
    typeof error.response.data.message === "string"
  ) {
    return error.response.data.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallbackMessage
}

export const createUserAction = async (payload: {
  full_name: string
  email: string
  password: string
  phone?: string
  role: string
  /** Null is "no department", and a real answer. */
  department_id?: string | null
}): Promise<ApiResponse<IUser> | ApiErrorResponse> => {
  try {
    return await createUser(payload)
  } catch (error: unknown) {
    return { success: false, message: getActionErrorMessage(error, "Failed to create team member") }
  }
}

export const updateUserAction = async (
  id: string,
  payload: {
    full_name?: string
    phone?: string
    role?: string
    status?: string
    department_id?: string | null
  },
): Promise<ApiResponse<IUser> | ApiErrorResponse> => {
  if (!id) {
    return { success: false, message: "Invalid user id" }
  }

  try {
    return await updateUser(id, payload)
  } catch (error: unknown) {
    return { success: false, message: getActionErrorMessage(error, "Failed to update team member") }
  }
}

export const deleteUserAction = async (
  id: string,
): Promise<ApiResponse<{ message: string }> | ApiErrorResponse> => {
  if (!id) {
    return { success: false, message: "Invalid user id" }
  }

  try {
    return await deleteUser(id)
  } catch (error: unknown) {
    return { success: false, message: getActionErrorMessage(error, "Failed to delete team member") }
  }
}
