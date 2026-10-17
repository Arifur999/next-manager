import { describe, expect, it } from "vitest"
import type { PublicPlan } from "@/zod/publicPlans.validation"
import { pickTeaserPlans } from "./pricing"

const plan = (code: string, trialDays: number | null = null): PublicPlan => ({
  code,
  name: code,
  price: 10,
  currency: "USD",
  billing_interval: "month",
  trial_days: trialDays,
  max_seats: null,
  max_projects: null,
  features: [],
})

const codes = (plans: PublicPlan[]) => plans.map((entry) => entry.code)

describe("pickTeaserPlans", () => {
  it("keeps the API's order and stops at the limit", () => {
    expect(codes(pickTeaserPlans([plan("a"), plan("b"), plan("c")], 2))).toEqual(["a", "b"])
  })

  it("keeps the starting plan when it would be cut", () => {
    expect(codes(pickTeaserPlans([plan("a"), plan("b"), plan("c"), plan("start", 14)], 3))).toEqual([
      "a",
      "b",
      "start",
    ])
  })

  it("changes nothing when the starting plan is already shown or there is none", () => {
    expect(codes(pickTeaserPlans([plan("start", 0), plan("b"), plan("c")], 2))).toEqual(["start", "b"])
    expect(codes(pickTeaserPlans([plan("a"), plan("b")], 4))).toEqual(["a", "b"])
    expect(pickTeaserPlans([], 4)).toEqual([])
  })
})
