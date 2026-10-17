import type { IAgencyInvite } from "@/types/platform.types"
import { isPast, parseISO } from "date-fns"

export const AGENCY_INVITE_STATES = ["waiting", "opened", "expired", "revoked"] as const

export type AgencyInviteState = (typeof AGENCY_INVITE_STATES)[number]

export const AGENCY_INVITE_STATE_LABEL: Record<AgencyInviteState, string> = {
  waiting: "Waiting",
  opened: "Opened",
  expired: "Expired",
  revoked: "Revoked",
}

// Opened wins over everything: once a company exists, the invite's later dates no longer matter.
export const agencyInviteState = (invite: Pick<IAgencyInvite, "used_at" | "revoked_at" | "expires_at">): AgencyInviteState => {
  if (invite.used_at) return "opened"
  if (invite.revoked_at) return "revoked"
  if (isPast(parseISO(invite.expires_at))) return "expired"
  return "waiting"
}
