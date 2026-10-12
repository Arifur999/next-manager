import { describe, expect, it } from "vitest"
import { getRefreshPlan, type AccessState, type RefreshPlan } from "./refreshPlan"

const cases: [AccessState, boolean, RefreshPlan][] = [
  ["valid", true, "none"],
  ["valid", false, "none"],
  ["expiring", true, "proactive"],
  ["expiring", false, "none"],
  ["expired", true, "recover"],
  ["expired", false, "none"],
  ["missing", true, "recover"],
  ["missing", false, "none"],
  ["invalid", true, "none"],
  ["invalid", false, "none"],
]

describe("getRefreshPlan", () => {
  it.each(cases)("access %s with refresh token %s plans %s", (accessState, hasRefreshToken, plan) => {
    expect(getRefreshPlan({ accessState, hasRefreshToken })).toBe(plan)
  })
})
