import { describe, expect, it } from "vitest"
import { describeStageEvent } from "./stages"

describe("describeStageEvent", () => {
  it("says which stage a lead was added in", () => {
    expect(describeStageEvent({ from_stage: null, to_stage: "new" })).toBe("Added in New")
  })

  it("names both ends of a move", () => {
    expect(describeStageEvent({ from_stage: "contacted", to_stage: "proposal" })).toBe(
      "Moved from Contacted to Proposal",
    )
  })
})
