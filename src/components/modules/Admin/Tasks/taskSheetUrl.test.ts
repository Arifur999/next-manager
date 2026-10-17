import { describe, expect, it } from "vitest"
import { withOpenTask } from "./taskSheetUrl"

describe("withOpenTask", () => {
  it("keeps the view and adds the task", () => {
    expect(withOpenTask("/admin/dashboard/tasks", "?view=list", "t1")).toBe("/admin/dashboard/tasks?view=list&task=t1")
  })

  it("replaces a task already open", () => {
    expect(withOpenTask("/dashboard/tasks", "task=t1&due=today", "t2")).toBe("/dashboard/tasks?task=t2&due=today")
  })

  it("closes back to the bare view", () => {
    expect(withOpenTask("/admin/dashboard/tasks", "?status=In+review&task=t1", null)).toBe(
      "/admin/dashboard/tasks?status=In+review",
    )
    expect(withOpenTask("/admin/dashboard/projects/p1", "?task=t1", null)).toBe("/admin/dashboard/projects/p1")
  })
})
