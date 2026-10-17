// Not "use server". Only logout() ever needed to be callable from a client
// component, and it lives in ./logout.ts now - leaving the directive here
// would keep publishing getUserInfo, updateMe and changePassword as endpoints
// that skip the actions wrapping them.

import "server-only"

import { logApiFailure } from "@/lib/apiFailure"
import { forwardAuthCookies } from "@/lib/authCookies"
import { httpClient } from "@/lib/axios/httpClient"
import { classifyLinkLookup, type LinkLookup } from "@/lib/linkLookup"
import { errorFields, logger } from "@/lib/logger"
import { classifyMeResponse } from "@/lib/session"
import { logout } from "@/services/logout"
import type { ApiResponse } from "@/types/api.types"
import type { ILoginResponse } from "@/types/auth.types"
import { type IUser } from "@/types/user.types"
import type {
    IAgencyJoinFormValues,
    IForgotPasswordFormValues,
    IJoinFormValues,
    ILoginFormValues,
    IRegisterPayload,
    IResetPasswordFormValues,
} from "@/zod/auth.validation"
import { cookies } from "next/headers"
import { cache } from "react"
import type { z } from "zod"
import { getApiBaseUrl } from "@/env"


// null means signed out (no token, or the API refused it). An outage throws,
// so the error boundary shows instead of a redirect to /login.
export const getUserInfo = cache(async (): Promise<IUser | null> => {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("accessToken")?.value

    if (!accessToken) {
        return null
    }

    let res: Response
    try {
        res = await fetch(`${getApiBaseUrl()}/auth/me`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Cookie: `accessToken=${accessToken}`,
            },
            cache: "no-store",
        })
    } catch (error) {
        logApiFailure("GET /auth/me", error)
        throw new Error("The API could not be reached while loading the session")
    }

    const outcome = classifyMeResponse(res.status)
    if (outcome === "unauthenticated") {
        return null
    }
    if (outcome === "unavailable") {
        logger.error("GET /auth/me failed", { status: res.status })
        throw new Error(`The API answered ${res.status} while loading the session`)
    }

    const { data } = await res.json()
    return data as IUser
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

const refusal = (message: string): ApiResponse<ILoginResponse | null> => ({ success: false, message, data: null })

/**
 * Sign in and carry the session to the browser. Callable only from a server
 * action (login, and register signing the new admin in), because only an
 * action may write cookies. Not exported from any "use server" file, so it is
 * never an endpoint of its own.
 */
export const signIn = async (credentials: ILoginFormValues): Promise<ApiResponse<ILoginResponse | null>> => {
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

/**
 * POST to an endpoint that needs no session: sign-up, a password reset,
 * accepting an invite. Plain fetch, because there are no cookies to forward and
 * none are set here; the API's envelope comes back whether it succeeded or not.
 */
const postPublic = async <TData>(path: string, payload: unknown) => {
    const res = await fetch(`${getApiBaseUrl()}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
    })

    return (await res.json()) as ApiResponse<TData>
}

/**
 * Check the token in an emailed link (an invite, a password reset) before its
 * page renders, so a dead link says so before anybody fills in a form. The path
 * carries the token, so it is never logged.
 */
export const lookupLinkToken = async <TData>(path: string, schema: z.ZodType<TData>): Promise<LinkLookup<TData>> => {
    let res: Response
    try {
        res = await fetch(`${getApiBaseUrl()}${path}`, { cache: "no-store", signal: AbortSignal.timeout(5000) })
    } catch (error) {
        logger.warn("Link check did not reach the API", errorFields(error))
        return { status: "unavailable" }
    }

    // nginx answers a dead upstream with an HTML 502, which is not JSON.
    const isJson = res.headers.get("content-type")?.includes("application/json")
    const lookup = classifyLinkLookup(res.status, isJson ? await res.json() : null, schema)
    if (lookup.status === "unavailable") logger.warn("Link check failed", { status: res.status })
    return lookup
}

/** Creates a company and its first admin. Returns the user, not tokens: the register action signs them in next. */
export const register = async (payload: IRegisterPayload) => postPublic<IUser>("/auth/register", payload)

/** Answers the same whether or not the address has an account. */
export const forgotPassword = async (payload: IForgotPasswordFormValues) =>
    postPublic<{ message: string }>("/auth/forgot-password", payload)

/** One answer for an expired, spent or unknown token: the server does not tell them apart. */
export const resetPassword = async (payload: IResetPasswordFormValues) =>
    postPublic<{ message: string }>("/auth/reset-password", payload)

/** The account is created pending, so no session is set: an admin approves it first. */
export const acceptInvite = async (token: string, payload: IJoinFormValues) =>
    postPublic(`/join/${encodeURIComponent(token)}/accept`, payload)

/** Joining the platform team: the account waits for an existing operator to approve it. */
export const acceptPlatformInvite = async (token: string, payload: IJoinFormValues) =>
    postPublic(`/platform-join/${encodeURIComponent(token)}/accept`, payload)

/** Opening an agency. The role is fixed to admin server-side, so this link cannot make an operator. */
export const acceptAgencyInvite = async (token: string, payload: IAgencyJoinFormValues) =>
    postPublic(`/agency-join/${encodeURIComponent(token)}/accept`, payload)
