import type { IPlan } from "@/types/platform.types"

type OrderedPlan = Pick<IPlan, "id" | "name" | "price_usd" | "sort_order">

export interface IPlanMove {
  id: string
  sort_order: number
}

// The pricing page's order (sort_order, then price), with the name breaking any tie left.
export const sortPlans = <TPlan extends OrderedPlan>(plans: TPlan[]): TPlan[] =>
  [...plans].sort(
    (a, b) => a.sort_order - b.sort_order || a.price_usd - b.price_usd || a.name.localeCompare(b.name),
  )

/**
 * The sort_order writes that move one plan a place up or down. Positions are
 * renumbered from 0, so plans that shared an order are separated the first
 * time and later moves touch two plans.
 */
export const planMoves = (plans: OrderedPlan[], planId: string, direction: "up" | "down"): IPlanMove[] => {
  const ordered = sortPlans(plans)
  const from = ordered.findIndex((plan) => plan.id === planId)
  const to = direction === "up" ? from - 1 : from + 1
  if (from === -1 || to < 0 || to >= ordered.length) return []

  const [moved] = ordered.splice(from, 1)
  ordered.splice(to, 0, moved)

  return ordered.flatMap((plan, index) => (plan.sort_order === index ? [] : [{ id: plan.id, sort_order: index }]))
}
