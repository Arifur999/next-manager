import { describe, expect, it } from "vitest"
import { canRoleReach } from "./authUtils"
import { pathOf } from "./navMatch"
import { projectViews, REPORT_VIEWS, taskViewsFor, viewsFor } from "./pageViews"

describe("viewsFor", () => {
  it("keeps only the reports a role may open", () => {
    expect(viewsFor(REPORT_VIEWS, "sales").map((tab) => tab.label)).toEqual(["Clients", "Sales"])
    expect(viewsFor(REPORT_VIEWS, "project_manager").map((tab) => tab.label)).toEqual([
      "Projects",
      "Tasks",
      "Team",
    ])
    expect(viewsFor(REPORT_VIEWS, "admin")).toHaveLength(REPORT_VIEWS.length)
  })

  it("never offers a tab that would bounce", () => {
    for (const tab of viewsFor(REPORT_VIEWS, "sales")) expect(canRoleReach(pathOf(tab.href), "sales")).toBe(true)
  })
})

describe("taskViewsFor", () => {
  it("gives a salesperson the work inside their own clients", () => {
    expect(taskViewsFor("sales").map((tab) => tab.label)).toContain("My clients")
    expect(taskViewsFor("admin").map((tab) => tab.label)).not.toContain("My clients")
  })
})

describe("projectViews", () => {
  it("adds a tab per status, by name", () => {
    expect(projectViews(["On hold"])).toEqual([
      { label: "All", href: "/admin/dashboard/projects" },
      { label: "Mine", href: "/admin/dashboard/projects?mine=true" },
      { label: "On hold", href: "/admin/dashboard/projects?status=On+hold" },
    ])
  })
})
