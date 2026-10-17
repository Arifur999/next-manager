import { describe, expect, it } from "vitest"
import { companiesMatching, companiesWithStanding } from "./companyLinks"
import { plansPageTab } from "./plansPageTab"

describe("company links", () => {
  it("opens the companies list on one standing, including not set up", () => {
    expect(companiesWithStanding("past_due")).toBe("/platform/customers?status=past_due")
    expect(companiesWithStanding("none")).toBe("/platform/customers?status=none")
  })

  it("searches for one company with its email or name encoded", () => {
    expect(companiesMatching("a+b@gate.co")).toBe("/platform/customers?search=a%2Bb%40gate.co")
  })
})

describe("plansPageTab", () => {
  it("opens assignments only when asked for, and plans for anything else", () => {
    expect(plansPageTab("assignments")).toBe("assignments")
    expect(plansPageTab("nonsense")).toBe("plans")
    expect(plansPageTab(null)).toBe("plans")
  })
})
