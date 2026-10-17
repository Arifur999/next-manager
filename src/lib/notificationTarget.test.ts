import { describe, expect, it } from "vitest"
import { formatDaysInText, notificationHref } from "./notificationTarget"

describe("notificationHref", () => {
  it("opens a task in the sheet of the area the reader works in", () => {
    const task = { entity_type: "task", entity_id: "t1" }
    expect(notificationHref(task, "project_manager")).toBe("/admin/dashboard/tasks?task=t1")
    expect(notificationHref(task, "operations")).toBe("/dashboard/tasks?task=t1")
  })

  it("opens an overdue invoice itself", () => {
    expect(notificationHref({ entity_type: "invoice", entity_id: "i1" }, "sales")).toBe("/admin/dashboard/invoices/i1")
  })

  it("sends leave, hours, payments and new members to where they are decided", () => {
    expect(notificationHref({ entity_type: "leave_request", entity_id: "l1" }, "operations")).toBe("/dashboard/leave")
    expect(notificationHref({ entity_type: "time_entry", entity_id: "e1" }, "project_manager")).toBe(
      "/admin/dashboard/time-approvals",
    )
    expect(notificationHref({ entity_type: "payment", entity_id: "p1" }, "admin")).toBe("/admin/dashboard/payments")
    expect(notificationHref({ entity_type: "user", entity_id: "u1" }, "admin")).toBe("/admin/dashboard/team-management")
  })

  it("links nowhere the reader's role cannot open", () => {
    expect(notificationHref({ entity_type: "payment", entity_id: "p1" }, "sales")).toBeNull()
    expect(notificationHref({ entity_type: "invoice", entity_id: "i1" }, "operations")).toBeNull()
  })

  it("links nowhere for a notice with nothing behind it", () => {
    expect(notificationHref({ entity_type: "", entity_id: null }, "admin")).toBeNull()
    expect(notificationHref({ entity_type: "task", entity_id: null }, "admin")).toBeNull()
  })
})

describe("formatDaysInText", () => {
  it("writes a raw day the way the app does", () => {
    expect(formatDaysInText("Due 2026-10-17")).toBe("Due 17 Oct 2026")
  })

  it("leaves text without a real day alone", () => {
    expect(formatDaysInText("No due date set")).toBe("No due date set")
    expect(formatDaysInText("Ref 2026-02-31")).toBe("Ref 2026-02-31")
  })
})
