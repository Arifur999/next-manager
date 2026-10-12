"use server"

import { httpClient } from "@/lib/axios/httpClient"
import { type IUser } from "@/types/user.types"

export const getAllUsers = async (queryString?: string) => {
  const params = queryString ? Object.fromEntries(new URLSearchParams(queryString)) : undefined
  return httpClient.get<IUser[]>("/users", { params })
}

export const getSingleUser = async (id: string) => httpClient.get<IUser>(`/users/${id}`)

export const createUser = async (payload: {
  full_name: string
  email: string
  password: string
  phone?: string
  role: string
}) => httpClient.post<IUser>("/users", payload)

export const updateUser = async (
  id: string,
  payload: { full_name?: string; phone?: string; role?: string; status?: string },
) => httpClient.patch<IUser>(`/users/${id}`, payload)

export const deleteUser = async (id: string) => httpClient.delete<{ message: string }>(`/users/${id}`)
