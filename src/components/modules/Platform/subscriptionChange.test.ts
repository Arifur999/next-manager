import { describe, expect, it } from "vitest"
import { describeSubscriptionChange } from "./subscriptionChange"

const hatch = { id: "p-hatch", name: "Hatch", price_usd: 29, max_seats: 3, max_projects: null }
const growth = { id: "p-growth", name: "Growth", price_usd: 79, max_seats: 20, max_projects: 50 }
const gate = { name: "Gate Co", people: 4 }

describe("describeSubscriptionChange", () => {
  it("names who loses access when a paying company is suspended", () => {
    expect(
      describeSubscriptionChange({
        company: gate,
        current: { status: "active", plan: hatch },
        next: { status: "suspended", plan: hatch },
      }),
    ).toEqual({
      title: "Suspend Gate Co?",
      description: "Its 4 people lose access now. It goes from paying $29/mo to nothing.",
      confirmLabel: "Suspend",
      destructive: true,
    })
  })

  it("says one person, not one people", () => {
    const summary = describeSubscriptionChange({
      company: { name: "Solo", people: 1 },
      current: { status: "trialing", plan: hatch },
      next: { status: "cancelled", plan: hatch },
    })
    expect(summary.title).toBe("Cancel Solo's subscription?")
    expect(summary.description).toBe("Its 1 person loses access now.")
  })

  it("restores a suspended company and says what it pays again", () => {
    const summary = describeSubscriptionChange({
      company: gate,
      current: { status: "suspended", plan: hatch },
      next: { status: "active", plan: hatch },
    })
    expect(summary.title).toBe("Restore Gate Co?")
    expect(summary.description).toBe("Its 4 people can sign in and work again. It goes from paying nothing to $29/mo.")
    expect(summary.destructive).toBe(false)
  })

  it("moves a company between plans with the new price and limits", () => {
    const summary = describeSubscriptionChange({
      company: gate,
      current: { status: "active", plan: hatch },
      next: { status: "active", plan: growth },
    })
    expect(summary.title).toBe("Move Gate Co to Growth?")
    expect(summary.description).toBe(
      "It goes from paying $29/mo to $79/mo. Its limits become 20 seats and 50 projects.",
    )
  })

  it("sets up a company that had no subscription", () => {
    const summary = describeSubscriptionChange({
      company: gate,
      current: null,
      next: { status: "trialing", plan: hatch },
    })
    expect(summary.title).toBe("Set up Gate Co on Hatch?")
    expect(summary.description).toBe("Its limits become 3 seats and unlimited projects.")
  })

  it("keeps past due counted as owed money", () => {
    const summary = describeSubscriptionChange({
      company: gate,
      current: { status: "active", plan: hatch },
      next: { status: "past_due", plan: hatch },
    })
    expect(summary.title).toBe("Mark Gate Co as past due?")
    expect(summary.description).toBe("Nothing about its access or what it pays changes.")
  })

  it("shows cents only when a price has them", () => {
    const summary = describeSubscriptionChange({
      company: gate,
      current: { status: "trialing", plan: hatch },
      next: { status: "active", plan: { ...hatch, price_usd: 29.5 } },
    })
    expect(summary.description).toBe("It goes from paying nothing to $29.50/mo.")
  })
})
