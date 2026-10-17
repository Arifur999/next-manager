import { describe, expect, it } from "vitest"
import { isPlanDraftChanged, isRepriced, planDraftOf } from "./planDraft"

const hatch = { price_usd: 29, max_seats: 3, max_projects: null, features: ["kpi", "vault"], is_public: true }

describe("planDraftOf", () => {
  it("types an unlimited limit as empty", () => {
    expect(planDraftOf(hatch)).toEqual({
      price_usd: "29",
      max_seats: "3",
      max_projects: "",
      features: ["kpi", "vault"],
      is_public: true,
    })
  })
})

describe("isPlanDraftChanged", () => {
  const draft = planDraftOf(hatch)

  it("is unchanged while the draft says what the plan says", () => {
    expect(isPlanDraftChanged(hatch, draft)).toBe(false)
    expect(isPlanDraftChanged(hatch, { ...draft, price_usd: "29.00", features: ["vault", "kpi"] })).toBe(false)
  })

  it("notices each field", () => {
    expect(isPlanDraftChanged(hatch, { ...draft, max_seats: "" })).toBe(true)
    expect(isPlanDraftChanged(hatch, { ...draft, max_projects: "10" })).toBe(true)
    expect(isPlanDraftChanged(hatch, { ...draft, features: ["kpi"] })).toBe(true)
    expect(isPlanDraftChanged(hatch, { ...draft, is_public: false })).toBe(true)
  })
})

describe("isRepriced", () => {
  it("reads an empty price as free", () => {
    expect(isRepriced({ ...hatch, price_usd: 0 }, { ...planDraftOf(hatch), price_usd: " " })).toBe(false)
    expect(isRepriced(hatch, { ...planDraftOf(hatch), price_usd: "49" })).toBe(true)
  })
})
