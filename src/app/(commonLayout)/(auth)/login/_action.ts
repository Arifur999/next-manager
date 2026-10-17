"use server"

import { getApiBaseUrl } from "@/env"
import { forwardAuthCookies } from "@/lib/authCookies"
import { runValidatedAction } from "@/lib/runAction"
import { logout } from "@/services/logout"
import type { ApiResponse } from "@/types/api.types"
import type { ILoginResponse } from "@/types/auth.types"
import { loginServerZodSchema, type ILoginFormValues } from "@/zod/auth.validation"

const refusal = (message: string): ApiResponse<ILoginResponse | null> => ({ success: false, message, data: null })

// Not exported, so not an endpoint: the only way in is loginAction, which validates first.
const signIn = async (credentials: ILoginFormValues): Promise<ApiResponse<ILoginResponse | null>> => {
    // Plain fetch rather than httpClient: there are no cookies to forward yet,
    // and this is the request that creates them.
    const res = await fetch(`${getApiBaseUrl()}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        cache: "no-store",
    })

    // nginx answers a dead upstream with an HTML 502, which is not JSON.
    if (!res.headers.get("content-type")?.includes("application/json")) return refusal("Failed to sign in")

    const body: ApiResponse<ILoginResponse> | null = await res.json()
    if (!res.ok || !body?.success) return refusal(body?.message ?? "Invalid email or password")

    // The API's Set-Cookie lands on this server-side response, which the browser
    // never sees; carrying it across is the only way anybody gets signed in. Only
    // a whole session counts: a "partial" one (an accessToken with no
    // refreshToken) passes the proxy and then dies at its first renewal, so it is
    // cleared again and reported rather than toasted as a success.
    if ((await forwardAuthCookies(res)) !== "set") {
        await logout()
        return refusal("Signed in, but no session was issued. Please try again.")
    }

    return body
}

export const loginAction = async (values: unknown) =>
    runValidatedAction(loginServerZodSchema, values, "Failed to sign in", signIn)
