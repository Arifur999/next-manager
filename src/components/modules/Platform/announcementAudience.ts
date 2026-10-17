import type { AnnouncementAudience } from "@/types/platform.types"

export const AUDIENCE_LABEL: Record<AnnouncementAudience, string> = {
  all: "Every customer",
  trialing: "Customers on a trial",
  active: "Paying customers",
}

/** What each audience is useful for, in the words somebody picking would use. */
export const AUDIENCE_HINT: Record<AnnouncementAudience, string> = {
  all: "Maintenance, new features, anything everyone needs to know.",
  trialing: "Nudges and onboarding — people who have not decided yet.",
  active: "Billing, price changes, plan news. Includes anyone in their grace window.",
}
