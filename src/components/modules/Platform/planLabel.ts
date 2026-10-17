import { formatUsd } from "@/lib/currency"

/** How every plan picker names a plan: "Starter — $29.00/mo". */
export const planOptionLabel = (plan: { name: string; price_usd: number }) =>
  `${plan.name} — ${formatUsd(plan.price_usd)}/mo`
