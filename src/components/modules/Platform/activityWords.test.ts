import { describe, expect, it } from "vitest"
import { actionLabel, readableSummary } from "./activityWords"

describe("actionLabel", () => {
  it("names the actions the server records", () => {
    expect(actionLabel("status_changed")).toBe("Status changed")
    expect(actionLabel("deleted")).toBe("Removed")
  })

  it("turns an unknown code into words", () => {
    expect(actionLabel("access_granted")).toBe("Access granted")
  })
})

describe("readableSummary", () => {
  it("replaces permission codes with their names", () => {
    expect(readableSummary("Set Ana's access to: platform.finance.view, platform.companies.manage")).toBe(
      "Set Ana's access to: see the numbers, create and change customers",
    )
  })

  it("leaves other summaries alone", () => {
    expect(readableSummary("Created the Hatch plan at $29/month")).toBe("Created the Hatch plan at $29/month")
  })
})
