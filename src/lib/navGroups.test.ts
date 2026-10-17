import { describe, expect, it } from "vitest"
import {
  currentGroupId,
  navGroupId,
  parseOpenGroups,
  serializeOpenGroups,
  toggleGroup,
  withGroupOpen,
} from "./navGroups"
import { getNavSections } from "./navItem"

describe("navGroupId", () => {
  it("turns a title into a cookie-safe id", () => {
    expect(navGroupId("Work")).toBe("work")
    expect(navGroupId("Platform team")).toBe("platform-team")
  })
})

describe("open groups cookie", () => {
  it("round-trips", () => {
    expect(parseOpenGroups(serializeOpenGroups(["work", "money"]))).toEqual(["work", "money"])
  })

  it("reads a missing or empty cookie as nothing open", () => {
    expect(parseOpenGroups(undefined)).toEqual([])
    expect(parseOpenGroups("")).toEqual([])
  })

  it("drops anything that is not a group id", () => {
    expect(parseOpenGroups("work.<script>.Money.time")).toEqual(["work", "time"])
  })
})

describe("currentGroupId", () => {
  const admin = getNavSections("admin")

  it("names the group holding the page", () => {
    expect(currentGroupId(admin, "/admin/dashboard/clients")).toBe("work")
    expect(currentGroupId(admin, "/admin/dashboard/clients/42")).toBe("work")
    expect(currentGroupId(admin, "/admin/dashboard/payroll")).toBe("money")
  })

  it("is null for a page in the untitled top group", () => {
    expect(currentGroupId(admin, "/admin/dashboard")).toBeNull()
    expect(currentGroupId(admin, "/admin/dashboard/reports/finance")).toBeNull()
  })

  it("is null for a page outside the nav", () => {
    expect(currentGroupId(admin, "/my-profile")).toBeNull()
  })
})

describe("withGroupOpen", () => {
  it("adds the group once", () => {
    expect(withGroupOpen(["work"], "money")).toEqual(["work", "money"])
    expect(withGroupOpen(["work"], "work")).toEqual(["work"])
  })

  it("leaves the list alone when there is no group", () => {
    const open = ["work"]
    expect(withGroupOpen(open, null)).toBe(open)
  })
})

describe("toggleGroup", () => {
  it("opens a closed group and closes an open one", () => {
    expect(toggleGroup(["work"], "money")).toEqual(["work", "money"])
    expect(toggleGroup(["work", "money"], "work")).toEqual(["money"])
  })
})
