import { describe, expect, it } from "vitest"
import { FAQ_ITEMS } from "./home/faq"
import { homeJsonLd } from "./schema"
import { site } from "./site"
import type { PublicPlan } from "@/zod/publicPlans.validation"

const plan: PublicPlan = {
  code: "starter",
  name: "Starter",
  price: 29,
  currency: "USD",
  billing_interval: "month",
  trial_days: 14,
  max_seats: 5,
  max_projects: null,
  features: [],
}

const build = (plans: PublicPlan[], publisher = "") =>
  homeJsonLd({ site: { ...site, publisher }, url: "https://example.test", plans, faq: FAQ_ITEMS })

const byType = (nodes: ReturnType<typeof build>, type: string) => nodes.find((node) => node["@type"] === type)

describe("homeJsonLd", () => {
  it("never carries a rating", () => {
    expect(JSON.stringify(build([plan], "Example Ltd"))).not.toContain("aggregateRating")
  })

  it("lists exactly the visible FAQ", () => {
    const faq = byType(build([]), "FAQPage")
    const questions = (faq?.mainEntity as Array<{ name: string; acceptedAnswer: { text: string } }>).map((q) => [q.name, q.acceptedAnswer.text])
    expect(questions).toEqual(FAQ_ITEMS.map((item) => [item.question, item.answer]))
  })

  it("adds offers only when plans exist", () => {
    expect(byType(build([]), "SoftwareApplication")).not.toHaveProperty("offers")
    const offers = byType(build([plan]), "SoftwareApplication")?.offers as Array<{ price: string; priceCurrency: string }>
    expect(offers).toEqual([expect.objectContaining({ price: "29.00", priceCurrency: "USD" })])
  })

  it("adds an Organization only when the publisher is named", () => {
    expect(byType(build([]), "Organization")).toBeUndefined()
    expect(byType(build([], "Example Ltd"), "Organization")).toMatchObject({ name: "Example Ltd" })
  })
})
