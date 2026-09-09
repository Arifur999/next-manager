// Not "use server", for the reason written out in cookiesUtils.ts: the
// directive would publish these as callable endpoints, and every caller here
// is server-side already.

import { jwtUtils } from "./jwtUtils"

// Refresh a little before the token actually dies, so a request that takes a
// second to reach the API isn't rejected by a token that expired in flight.
const EXPIRY_LEEWAY_SECONDS = 60

// Synchronous. It decodes and compares two numbers - there is no I/O here.
// The async was only ever there to satisfy "use server", which required every
// export to be a promise; with the directive gone it was a microtask per
// request on the proxy's hot path, and an await at both call sites, for
// nothing.
export const isTokenExpiringSoon = (token: string): boolean => {
  const decoded = jwtUtils.decodeToken(token)

  if (!decoded?.exp) {
    // No expiry claim means we cannot reason about it - treat as expiring so the
    // refresh path runs rather than letting a stuck token through.
    return true
  }

  const nowInSeconds = Math.floor(Date.now() / 1000)
  return decoded.exp - nowInSeconds <= EXPIRY_LEEWAY_SECONDS
}
