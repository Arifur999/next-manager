import { describe, expect, it } from "vitest"
import { publicPlansResponseSchema, signupTrialDays, type PublicPlan } from "./publicPlans.validation"

const plan = (overrides: Partial<Record<keyof PublicPlan, unknown>> = {}) => ({
  code: "starter",
  name: "Starter",
  price: 29,
  currency: "USD",
  billing_interval: "month",
  trial_days: null,
  max_seats: 5,
  max_projects: null,
  features: ["Time tracking"],
  ...overrides,
})

const parse = (plans: unknown[]) => publicPlansResponseSchema.safeParse({ success: true, message: "ok", data: plans })

describe("publicPlansResponseSchema", () => {
  it("keeps null limits as null (unlimited), not zero", () => {
    const result = parse([plan({ max_seats: null })])
    expect(result.success && result.data.data[0].max_seats).toBeNull()
  })

  it("turns a decimal string price into a number", () => {
    const result = parse([plan({ price: "29.50" })])
    expect(result.success && result.data.data[0].price).toBe(29.5)
  })

  it("rejects a plan in another currency or interval", () => {
    expect(parse([plan({ currency: "BDT" })]).success).toBe(false)
    expect(parse([plan({ billing_interval: "year" })]).success).toBe(false)
  })

  it("rejects a negative price and a failed envelope", () => {
    expect(parse([plan({ price: -1 })]).success).toBe(false)
    expect(publicPlansResponseSchema.safeParse({ success: false, message: "down" }).success).toBe(false)
  })
})

describe("signupTrialDays", () => {
  const typed = (overrides: Partial<PublicPlan>): PublicPlan => ({ ...(plan() as PublicPlan), ...overrides })

  it("reads the trial from the plan sign-up starts on", () => {
    expect(signupTrialDays([typed({}), typed({ code: "pro", trial_days: 14 })])).toBe(14)
  })

  it("promises no trial when it is 0 days or absent", () => {
    expect(signupTrialDays([typed({ trial_days: 0 })])).toBeNull()
    expect(signupTrialDays([typed({})])).toBeNull()
    expect(signupTrialDays([])).toBeNull()
  })
})
