"use server"

import { setTokenInCookies } from "@/lib/tokenUtils"
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types"
import { type ILoginResponse } from "@/types/auth.types"

const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL

// One place that turns an unknown thrown value into a message worth showing.
// Without it a component sees "Request failed with status code 401" instead of
// the backend's own "Invalid email or password".
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

export const loginAction = async (payload: {
  email: string
  password: string
}): Promise<ApiResponse<ILoginResponse> | ApiErrorResponse> => {
  try {
    // Plain fetch rather than httpClient: there are no cookies to forward yet,
    // and this is the request that creates them.
    const res = await fetch(`${BASE_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    })

    const body = await res.json()

    if (!res.ok || !body?.success) {
      return { success: false, message: body?.message ?? "Invalid email or password" }
    }

    const { accessToken, refreshToken } = body.data ?? {}

    if (accessToken) await setTokenInCookies("accessToken", accessToken)
    if (refreshToken) await setTokenInCookies("refreshToken", refreshToken)

    return body as ApiResponse<ILoginResponse>
  } catch (error: unknown) {
    return { success: false, message: getActionErrorMessage(error, "Failed to sign in") }
  }
}
