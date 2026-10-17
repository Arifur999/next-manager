import type { IPlatformTrend } from "@/types/platform.types"

type PlanRevenueRow = IPlatformTrend["revenue_by_plan"][number]

export interface IPlanRevenueBar extends PlanRevenueRow {
  key: string
}

const cents = (value: number) => Math.round(value * 100) / 100

/**
 * The biggest plans by monthly revenue, the rest folded into one "Other" bar.
 * Rows arrive one per plan, and two plans can share a name, so the key is the
 * row's place rather than its name.
 */
export const topPlanRevenue = (rows: PlanRevenueRow[], shown = 5): IPlanRevenueBar[] => {
  const ranked = rows
    .map((row, index) => ({ ...row, key: `plan-${index}` }))
    .sort((a, b) => b.mrr_usd - a.mrr_usd)

  // Folding a single plan into "Other" would hide its name and save no space.
  if (ranked.length <= shown + 1) return ranked

  const rest = ranked.slice(shown)
  return [
    ...ranked.slice(0, shown),
    {
      key: "other",
      name: `Other (${rest.length} plans)`,
      companies: rest.reduce((total, row) => total + row.companies, 0),
      mrr_usd: cents(rest.reduce((total, row) => total + row.mrr_usd, 0)),
    },
  ]
}
