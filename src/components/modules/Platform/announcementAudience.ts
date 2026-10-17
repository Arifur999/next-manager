import type { AnnouncementAudience, IPlatformOverview } from "@/types/platform.types"

export const AUDIENCE_LABEL: Record<AnnouncementAudience, string> = {
  all: "Every customer",
  trialing: "Customers on a trial",
  active: "Paying customers",
}

/** What each audience is useful for, in the words somebody picking would use. */
export const AUDIENCE_HINT: Record<AnnouncementAudience, string> = {
  all: "Maintenance, new features, anything everyone needs to know.",
  trialing: "Nudges and onboarding for companies still deciding.",
  active: "Billing, price changes and plan news. Includes companies in their grace window.",
}

// How many companies an audience covers today, by the server's rule: paying includes past due.
export const audienceReach = (audience: AnnouncementAudience, companies: IPlatformOverview["companies"]) => {
  if (audience === "trialing") return companies.trialing
  if (audience === "active") return companies.active + companies.past_due
  return companies.total
}
