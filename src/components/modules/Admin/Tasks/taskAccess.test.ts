import { describe, expect, it } from "vitest"
import { canEditTask, taskAccessFor } from "./taskAccess"

describe("taskAccessFor", () => {
  it("matches who PATCH /tasks/:id lets in", () => {
    expect(taskAccessFor("admin")).toBe("manage")
    expect(taskAccessFor("project_manager")).toBe("manage")
    expect(taskAccessFor("operations")).toBe("own")
    expect(taskAccessFor("sales")).toBe("read")
    expect(taskAccessFor(null)).toBe("read")
  })
})

describe("canEditTask", () => {
  it("lets operations change only a task assigned to them", () => {
    expect(canEditTask("own", { assignee_id: "me" }, "me")).toBe(true)
    expect(canEditTask("own", { assignee_id: "someone" }, "me")).toBe(false)
    expect(canEditTask("own", { assignee_id: null }, "me")).toBe(false)
  })

  it("lets a manager change any task and sales none", () => {
    expect(canEditTask("manage", { assignee_id: null }, null)).toBe(true)
    expect(canEditTask("read", { assignee_id: "me" }, "me")).toBe(false)
  })
})
