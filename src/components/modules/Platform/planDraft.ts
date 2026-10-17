import type { IPlan } from "@/types/platform.types"
import type { IPlanRowFormValues } from "@/zod/platform.validation"

type PlanTerms = Pick<IPlan, "price_usd" | "max_seats" | "max_projects" | "features" | "is_public">

// Empty is unlimited, so a limit is typed as "" rather than shown as a number.
const typedLimit = (limit: number | null) => (limit === null ? "" : String(limit))

export const planDraftOf = (plan: PlanTerms): IPlanRowFormValues => ({
  price_usd: String(plan.price_usd),
  max_seats: typedLimit(plan.max_seats),
  max_projects: typedLimit(plan.max_projects),
  features: plan.features,
  is_public: plan.is_public,
})

// An empty price is a free plan, as the server schema reads it.
export const typedPrice = (typed: string | undefined) => (typed?.trim() ? Number(typed) : 0)

const sameLimit = (typed: string, saved: number | null) =>
  typed.trim() === "" ? saved === null : Number(typed) === saved

const sameFeatures = (typed: string[], saved: string[]) =>
  typed.length === saved.length && typed.every((slug) => saved.includes(slug))

/** A new price moves what every company on the plan pays, so it is confirmed first. */
export const isRepriced = (plan: PlanTerms, draft: IPlanRowFormValues) => typedPrice(draft.price_usd) !== plan.price_usd

export const isPlanDraftChanged = (plan: PlanTerms, draft: IPlanRowFormValues) =>
  isRepriced(plan, draft) ||
  !sameLimit(draft.max_seats, plan.max_seats) ||
  !sameLimit(draft.max_projects, plan.max_projects) ||
  !sameFeatures(draft.features, plan.features) ||
  draft.is_public !== plan.is_public
