// Not "use server". Only logout() ever needed to be callable from a client
// component, and it lives in ./logout.ts now - leaving the directive here
// would keep publishing getUserInfo, updateMe and changePassword as endpoints
// that skip the actions wrapping them.

import { httpClient } from "@/lib/axios/httpClient"
import { type IUser } from "@/types/user.types"
import { cookies } from "next/headers"
import { cache } from "react"
import { SERVER_API_BASE_URL } from "@/lib/apiBaseUrl"

const BASE_API_URL = SERVER_API_BASE_URL

export const getUserInfo = cache(async (): Promise<IUser | null> => {
    try {
        const cookieStore = await cookies()
        const accessToken = cookieStore.get("accessToken")?.value

        if (!accessToken) {
            return null
        }

        const res = await fetch(`${BASE_API_URL}/auth/me`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Cookie: `accessToken=${accessToken}`,
            },
            cache: "no-store",
        })

        if (!res.ok) {
            return null
        }

        const { data } = await res.json()
        return data as IUser
    } catch (error) {
        console.error("Error fetching user info:", error)
        return null
    }
})

/**
 * Edit your own record.
 *
 * Deliberately not updateUser: that one is admin-only and can move a role. The
 * server keeps a three-field allow-list and refuses anything else, so a payload
 * that grew an extra key comes back as an error rather than a silent no-op.
 */
export const updateMe = async (payload: Record<string, unknown>) =>
    httpClient.patch<IUser>("/auth/me", payload)

export const changePassword = async (payload: Record<string, unknown>) =>
    httpClient.post<{ message: string }>("/auth/change-password", payload)
