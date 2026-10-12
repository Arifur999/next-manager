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
