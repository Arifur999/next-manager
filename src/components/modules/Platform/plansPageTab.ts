import { pickAllowed } from "@/lib/queryString"

export const PLANS_PAGE_TABS = ["plans", "assignments"] as const

export type PlansPageTab = (typeof PLANS_PAGE_TABS)[number]

// Anything but a known tab opens the plans themselves.
export const plansPageTab = (value: string | string[] | null | undefined): PlansPageTab =>
  pickAllowed(value, PLANS_PAGE_TABS) ?? "plans"
