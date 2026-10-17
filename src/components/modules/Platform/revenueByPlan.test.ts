import { describe, expect, it } from "vitest"
import { topPlanRevenue } from "./revenueByPlan"

const row = (name: string, mrr_usd: number, companies = 1) => ({ name, mrr_usd, companies })

describe("topPlanRevenue", () => {
  it("sorts by monthly revenue and keeps every plan when there are few", () => {
    const bars = topPlanRevenue([row("Starter", 29), row("Scale", 199), row("Growth", 79)])
    expect(bars.map((bar) => bar.name)).toEqual(["Scale", "Growth", "Starter"])
  })

  it("folds everything past the top five into Other", () => {
    const rows = [10, 60, 20, 50, 30, 40, 5.55, 4.45].map((mrr, index) => row(`P${index}`, mrr, 2))
    const bars = topPlanRevenue(rows)
    expect(bars).toHaveLength(6)
    expect(bars.map((bar) => bar.mrr_usd)).toEqual([60, 50, 40, 30, 20, 20])
    expect(bars[5]).toEqual({ key: "other", name: "Other (3 plans)", companies: 6, mrr_usd: 20 })
  })

  it("keeps two plans with one name apart", () => {
    const keys = topPlanRevenue([row("Hatch", 29), row("Hatch", 29)]).map((bar) => bar.key)
    expect(new Set(keys).size).toBe(2)
  })

  it("does not fold a lone sixth plan", () => {
    const rows = [6, 5, 4, 3, 2, 1].map((mrr, index) => row(`P${index}`, mrr))
    expect(topPlanRevenue(rows).map((bar) => bar.name)).toEqual(["P0", "P1", "P2", "P3", "P4", "P5"])
  })
})
