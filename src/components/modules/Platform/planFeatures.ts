import { featureName } from "@/data/home/pricing"

// The capabilities the product gates on, in the order the pricing page lists
// them. Labels come from featureName, the same words the pricing page uses.
const KNOWN_FEATURES = ["kpi", "vault", "time_tracking", "reports", "priority_support"]

export interface IFeatureChoice {
  slug: string
  label: string
}

// Known features first; a slug some plan already carries stays choosable, so saving never drops it.
export const featureChoices = (plans: Array<{ features: string[] }>): IFeatureChoice[] => {
  const extras = [...new Set(plans.flatMap((plan) => plan.features))]
    .filter((slug) => !KNOWN_FEATURES.includes(slug))
    .sort()

  return [...KNOWN_FEATURES, ...extras].map((slug) => ({ slug, label: featureName(slug) }))
}

export const featureList = (features: string[]) => features.map(featureName).join(", ")
