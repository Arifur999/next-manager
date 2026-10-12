export type AccessState = "valid" | "expiring" | "expired" | "missing" | "invalid"
export type RefreshPlan = "none" | "proactive" | "recover"

// proactive: the access token still works but is about to die, renew it early.
// recover: it is gone or expired, so the refresh token is the only way back in.
// A token with a bad signature is never renewed: that is tampering, not age.
export const getRefreshPlan = ({
  accessState,
  hasRefreshToken,
}: {
  accessState: AccessState
  hasRefreshToken: boolean
}): RefreshPlan => {
  if (!hasRefreshToken) return "none"
  if (accessState === "expiring") return "proactive"
  if (accessState === "expired" || accessState === "missing") return "recover"
  return "none"
}
