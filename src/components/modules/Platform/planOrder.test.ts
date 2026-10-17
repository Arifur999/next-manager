import { describe, expect, it } from "vitest"
import { planMoves, sortPlans } from "./planOrder"

const plan = (id: string, sort_order: number, price_usd = 0) => ({ id, name: id, price_usd, sort_order })

describe("sortPlans", () => {
  it("orders by sort_order, then price, then name", () => {
    const plans = [plan("scale", 1, 199), plan("growth", 1, 79), plan("b", 0, 0), plan("a", 0, 0)]
    expect(sortPlans(plans).map((row) => row.id)).toEqual(["a", "b", "growth", "scale"])
  })
})

describe("planMoves", () => {
  const numbered = [plan("trial", 0), plan("starter", 1, 29), plan("growth", 2, 79)]

  it("swaps two neighbours when the order is already numbered", () => {
    expect(planMoves(numbered, "growth", "up")).toEqual([
      { id: "growth", sort_order: 1 },
      { id: "starter", sort_order: 2 },
    ])
  })

  it("does nothing past either end", () => {
    expect(planMoves(numbered, "trial", "up")).toEqual([])
    expect(planMoves(numbered, "growth", "down")).toEqual([])
    expect(planMoves(numbered, "missing", "down")).toEqual([])
  })

  it("separates plans that shared an order", () => {
    const tied = [plan("hatch", 0, 0), plan("tiny", 0, 5), plan("last", 0, 9)]
    expect(planMoves(tied, "last", "up")).toEqual([
      { id: "last", sort_order: 1 },
      { id: "tiny", sort_order: 2 },
    ])
  })
})
