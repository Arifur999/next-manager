"use server"

import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types"
import { type ILoginResponse } from "@/types/auth.types"
import { SERVER_API_BASE_URL } from "@/lib/apiBaseUrl"
import { forwardAuthCookies } from "@/lib/authCookies"

const BASE_API_URL = SERVER_API_BASE_URL

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

    // From the API's Set-Cookie, not from the body. This server action is the
    // only thing that puts auth cookies in the browser - the API's own header
    // lands on the fetch Response above, which the browser never sees - so if
    // this does not carry them across, nobody is signed in.
    const forwarded = await forwardAuthCookies(res)

    if (!forwarded) {
        // Loudly, rather than returning a success the browser cannot act on:
        // the toast would say "Signed in", the redirect would fire, and the
        // proxy would bounce it straight back to /login.
        return { success: false, message: "Signed in, but no session was issued. Please try again." }
    }

    return body as ApiResponse<ILoginResponse>
  } catch (error: unknown) {
    return { success: false, message: getActionErrorMessage(error, "Failed to sign in") }
  }
}
