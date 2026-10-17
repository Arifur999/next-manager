import { describe, expect, it } from "vitest"
import { audienceReach } from "./announcementAudience"

const companies = { total: 837, unprovisioned: 507, trialing: 198, active: 130, past_due: 2, suspended: 0, cancelled: 0 }

describe("audienceReach", () => {
  it("counts every company, set up or not, for everyone", () => {
    expect(audienceReach("all", companies)).toBe(837)
  })

  it("counts trials, and paying companies with the ones past due", () => {
    expect(audienceReach("trialing", companies)).toBe(198)
    expect(audienceReach("active", companies)).toBe(132)
  })
})
