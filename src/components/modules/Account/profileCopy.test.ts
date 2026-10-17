import { ALL_ROLES } from "@/lib/authUtils"
import { describe, expect, it } from "vitest"
import { getProfileCopy } from "./profileCopy"

describe("getProfileCopy", () => {
  it("never sends the platform team to an agency or an admin", () => {
    const copy = Object.values(getProfileCopy("super_admin")).join(" ")
    expect(copy).not.toMatch(/agency|admin|colleague|timesheet/i)
  })

  it("names every role in words", () => {
    for (const role of ALL_ROLES) {
      expect(getProfileCopy(role).roleLabel).not.toMatch(/_/)
    }
  })
})
