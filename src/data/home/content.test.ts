import { canRoleReach } from "@/lib/authUtils"
import { describe, expect, it } from "vitest"
import { getPrimaryCta } from "../site"
import { MODULE_FACTS, MODULES } from "./modules"
import { ROLE_CLOSED_EXAMPLES, ROLE_COLUMNS } from "./roles"
import { readFileSync } from "node:fs"

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8")

describe("landing page invariants", () => {
  it("has one primary CTA label, from getPrimaryCta, in the header, hero, pricing, closing band and footer", () => {
    const sources = {
      header: read("../../components/modules/Home/Shell/MarketingHeader.tsx"),
      hero: read("../../components/modules/Home/Hero/Hero.tsx"),
      pricing: read("../../components/modules/Home/Pricing/PricingTeaser.tsx"),
      closing: read("../../components/modules/Home/FinalCta/FinalCta.tsx"),
      footer: read("../../components/modules/Home/Shell/MarketingFooter.tsx"),
      layout: read("../../app/(commonLayout)/(marketing)/layout.tsx"),
    }
    // Each place renders the label it was handed, never its own words.
    expect(sources.hero).toContain("getPrimaryCta(trialDays)")
    expect(sources.pricing).toContain("getPrimaryCta(trialDays)")
    expect(sources.closing).toContain("getPrimaryCta(trialDays)")
    expect(sources.layout).toContain("getPrimaryCta(")
    expect(sources.layout).toContain("cta={cta}")
    for (const source of [sources.header, sources.hero, sources.pricing, sources.closing]) {
      expect(source).toContain("{cta.label}")
    }
    expect(sources.footer).toContain("label: cta.label")
    for (const source of Object.values(sources)) {
      expect(source).not.toMatch(/>\s*(Start your free trial|Create your workspace)\s*</)
      expect(source).not.toMatch(/Create a workspace/)
    }
  })

  it("promises a trial only when one longer than 0 days is reported", () => {
    expect(getPrimaryCta(14).label).toBe("Start your free trial")
    expect(getPrimaryCta(0).label).toBe("Create your workspace")
    expect(getPrimaryCta(null).label).toBe("Create your workspace")
  })

  it("lists only routes each role can open, and keeps the closed ones closed", () => {
    for (const column of ROLE_COLUMNS) {
      for (const item of column.opens) {
        expect(canRoleReach(item.route, column.role), `${column.role} -> ${item.route}`).toBe(true)
      }
    }
    for (const example of ROLE_CLOSED_EXAMPLES) {
      expect(canRoleReach(example.route, example.role), `${example.role} -> ${example.route}`).toBe(false)
    }
  })

  it("derives the module count from MODULES", () => {
    expect(MODULE_FACTS.find((fact) => fact.label === "modules")?.value).toBe(MODULES.length)
  })
})
