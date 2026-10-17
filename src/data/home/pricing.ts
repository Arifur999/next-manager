import type { PublicPlan } from "@/zod/publicPlans.validation"

export const PRICING = {
  title: "Plans",
  body: "Prices are per workspace, per month, in US dollars. They come straight from the plans the platform offers today.",
  startsHere: "Where a new workspace starts",
  unlimited: "Unlimited",
  free: "Free",
  maxPlans: 4,
  maxFeatures: 5,
} as const

// The API sends feature slugs; known ones get a readable name, others are
// humanised so a new slug still reads as words.
const FEATURE_NAMES: Record<string, string> = {
  kpi: "KPI targets",
  vault: "Credential vault",
  time_tracking: "Time tracking",
  reports: "Reports",
  priority_support: "Priority support",
}

export const featureName = (slug: string) => {
  const known = FEATURE_NAMES[slug]
  if (known) return known
  const words = slug.replace(/[_-]+/g, " ").trim()
  return words.charAt(0).toUpperCase() + words.slice(1)
}

/** The plan a new workspace starts on: the only one the API gives trial days. */
export const isStartingPlan = (plan: PublicPlan) => plan.trial_days !== null

/**
 * The first `max` plans in the API's order, with the starting plan swapped in
 * for the last of them when it would otherwise be cut: the teaser marks where
 * a new workspace starts, so that plan is the one it cannot leave out.
 */
export const pickTeaserPlans = (plans: PublicPlan[], max: number): PublicPlan[] => {
  const shown = plans.slice(0, max)
  const starting = plans.find(isStartingPlan)
  if (!starting || shown.includes(starting) || shown.length === 0) return shown
  return [...shown.slice(0, -1), starting]
}
