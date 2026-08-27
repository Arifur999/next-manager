"use server"

import { jwtUtils } from "./jwtUtils"
import { setCookie } from "./cookiesUtils"

// Refresh a little before the token actually dies, so a request that takes a
// second to reach the API isn't rejected by a token that expired in flight.
const EXPIRY_LEEWAY_SECONDS = 60

export const isTokenExpiringSoon = async (token: string): Promise<boolean> => {
  const decoded = jwtUtils.decodeToken(token)

  if (!decoded?.exp) {
    // No expiry claim means we cannot reason about it - treat as expiring so the
    // refresh path runs rather than letting a stuck token through.
    return true
  }

  const nowInSeconds = Math.floor(Date.now() / 1000)
  return decoded.exp - nowInSeconds <= EXPIRY_LEEWAY_SECONDS
}

const ONE_DAY = 24 * 60 * 60
const SEVEN_DAYS = 7 * ONE_DAY

export const setTokenInCookies = async (
  name: "accessToken" | "refreshToken",
  value: string,
  maxAgeInSeconds?: number,
) => {
  await setCookie(name, value, maxAgeInSeconds ?? (name === "refreshToken" ? SEVEN_DAYS : ONE_DAY))
}
