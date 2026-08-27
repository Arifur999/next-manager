"use server"

import { deleteCookie } from "@/lib/cookiesUtils"
import { setTokenInCookies } from "@/lib/tokenUtils"
import { type IUser } from "@/types/user.types"
import { cookies } from "next/headers"
import { cache } from "react"

const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL

if (!BASE_API_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined")
}

// Uses fetch rather than httpClient on purpose: httpClient calls back into this
// module to refresh, so going through it here would recurse.
export async function getNewTokensWithRefreshToken(refreshToken: string): Promise<boolean> {
    try {
        const res = await fetch(`${BASE_API_URL}/auth/refresh-token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Cookie: `refreshToken=${refreshToken}`,
            },
            cache: "no-store",
        })

        if (!res.ok) {
            return false
        }

        const { data } = await res.json()
        const { accessToken, refreshToken: newRefreshToken } = data ?? {}

        if (accessToken) {
            await setTokenInCookies("accessToken", accessToken)
        }

        if (newRefreshToken) {
            await setTokenInCookies("refreshToken", newRefreshToken)
        }

        return true
    } catch (error) {
        console.error("Error refreshing token:", error)
        return false
    }
}

// Multiple Server Components in the same request tree (sidebar, navbar, page
// content) each call this independently. Without request-level dedup that is
// several separate live round-trips per page load, and if any single one is
// slow or flaky that component silently loses its user data while the others
// render fine - the sidebar vanishing while the page content still shows.
// cache() gives one real fetch per request, shared by every caller.
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

export const logout = async () => {
    await deleteCookie("accessToken")
    await deleteCookie("refreshToken")
}
