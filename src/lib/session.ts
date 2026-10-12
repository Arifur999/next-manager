// How /auth/me answered. Only an explicit refusal means signed out; anything
// else (5xx, timeout, network) is an outage and must not end the session.
export type MeOutcome = "authenticated" | "unauthenticated" | "unavailable"

export const classifyMeResponse = (status: number): MeOutcome => {
    if (status >= 200 && status < 300) return "authenticated"
    if (status === 401 || status === 403) return "unauthenticated"
    return "unavailable"
}
