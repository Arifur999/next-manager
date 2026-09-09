// Not "use server", for the reason written out in cookiesUtils.ts: the
// directive would publish these as callable endpoints, and every caller here
// is server-side already.

import { jwtUtils } from "./jwtUtils"

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
