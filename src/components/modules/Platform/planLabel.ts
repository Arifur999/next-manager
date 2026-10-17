import { formatUsd } from "@/lib/currency"

/** A plan's price as people say it: "$49/mo", with cents only when there are some. */
export const monthlyPrice = (price: number) => `${formatUsd(price).replace(/\.00$/, "")}/mo`

/** How every plan picker names a plan: "Starter ($29/mo)". */
export const planOptionLabel = (plan: { name: string; price_usd: number }) =>
  `${plan.name} (${monthlyPrice(plan.price_usd)})`
