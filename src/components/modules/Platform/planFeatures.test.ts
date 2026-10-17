import { describe, expect, it } from "vitest"
import { featureChoices, featureList } from "./planFeatures"

describe("featureChoices", () => {
  it("lists the known features by name", () => {
    expect(featureChoices([]).map((choice) => choice.label)).toEqual([
      "KPI targets",
      "Credential vault",
      "Time tracking",
      "Reports",
      "Priority support",
    ])
  })

  it("keeps a slug only some plan carries, after the known ones", () => {
    const choices = featureChoices([{ features: ["vault", "white_label"] }, { features: ["api_access"] }])
    expect(choices.slice(-2)).toEqual([
      { slug: "api_access", label: "Api access" },
      { slug: "white_label", label: "White label" },
    ])
  })
})

describe("featureList", () => {
  it("reads slugs as words", () => {
    expect(featureList(["kpi", "time_tracking"])).toBe("KPI targets, Time tracking")
  })
})
