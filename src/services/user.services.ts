"use server"

import { httpClient } from "@/lib/axios/httpClient"
import { type IUser } from "@/types/user.types"

export const getAllUsers = async (queryString?: string) => {
  try {
    const params = queryString ? Object.fromEntries(new URLSearchParams(queryString)) : undefined
    return await httpClient.get<IUser[]>("/users", { params })
  } catch (error) {
    console.log("Error fetching users:", error)
    throw error
  }
}

export const getSingleUser = async (id: string) => {
  try {
    return await httpClient.get<IUser>(`/users/${id}`)
  } catch (error) {
    console.log("Error fetching user:", error)
    throw error
  }
}

export const createUser = async (payload: {
  full_name: string
  email: string
  password: string
  phone?: string
  role: string
}) => {
  try {
    return await httpClient.post<IUser>("/users", payload)
  } catch (error) {
    console.log("Error creating user:", error)
    throw error
  }
}

export const updateUser = async (
  id: string,
  payload: { full_name?: string; phone?: string; role?: string; status?: string },
) => {
  try {
    return await httpClient.patch<IUser>(`/users/${id}`, payload)
  } catch (error) {
    console.log("Error updating user:", error)
    throw error
  }
}

export const deleteUser = async (id: string) => {
  try {
    return await httpClient.delete<{ message: string }>(`/users/${id}`)
  } catch (error) {
    console.log("Error deleting user:", error)
    throw error
  }
}

/**
 * What a colleague may do inside their role.
 *
 * Its own call rather than a field on the user update: setting access is a
 * deliberate act, and an empty array means something specific — everything the
 * role allows.
 */
export const setUserPermissions = async (id: string, permissions: string[]) => {
    const res = await httpClient.patch<IUser>(`/users/${id}/permissions`, { permissions })
    return res
}
