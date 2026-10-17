import { describe, expect, it } from "vitest"
import type { IStatusRef } from "@/types/common.types"
import { isTaskOverdue } from "./taskDue"

const status = (category: IStatusRef["category"]): IStatusRef => ({ id: "s", name: "Any", category, sort_order: 0 })
const today = new Date(2026, 9, 17)

describe("isTaskOverdue", () => {
  it("flags open work past its day", () => {
    expect(isTaskOverdue({ due_date: "2026-10-16", status: status("active") }, today)).toBe(true)
  })

  it("does not flag work due today, or with no day", () => {
    expect(isTaskOverdue({ due_date: "2026-10-17", status: status("open") }, today)).toBe(false)
    expect(isTaskOverdue({ due_date: null, status: status("open") }, today)).toBe(false)
  })

  it("never flags finished or cancelled work", () => {
    expect(isTaskOverdue({ due_date: "2026-01-01", status: status("done") }, today)).toBe(false)
    expect(isTaskOverdue({ due_date: "2026-01-01", status: status("cancelled") }, today)).toBe(false)
  })
})
