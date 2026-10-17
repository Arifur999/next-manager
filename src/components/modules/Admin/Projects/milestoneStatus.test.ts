import type { IMilestone } from "@/types/project.types"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { statusOf } from "./milestoneStatus"

const milestone = (overrides: Partial<IMilestone>): IMilestone => ({
  id: "m1",
  project_id: "p1",
  title: "Design handover",
  description: "",
  due_date: "2026-10-10",
  submitted_at: null,
  accepted_at: null,
  sort_order: 0,
  created_at: "2026-09-01T00:00:00.000Z",
  ...overrides,
})

describe("statusOf", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-10-05T12:00:00Z"))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("is due while the date is still ahead", () => {
    expect(statusOf(milestone({}))).toEqual({ label: "due", late: false, category: "open" })
  })

  it("is still due, not overdue, during the due day itself", () => {
    vi.setSystemTime(new Date("2026-10-10T15:00:00Z"))
    expect(statusOf(milestone({}))).toEqual({ label: "due", late: false, category: "open" })
  })

  it("is overdue once the due day has passed without a submission", () => {
    vi.setSystemTime(new Date("2026-10-12T09:00:00Z"))
    expect(statusOf(milestone({}))).toEqual({ label: "overdue", late: true, category: "blocked" })
  })

  it("counts a submission late in the evening of the due day as on time", () => {
    expect(statusOf(milestone({ submitted_at: "2026-10-10T22:45:00.000Z" }))).toEqual({
      label: "submitted",
      late: false,
      category: "active",
    })
  })

  it("marks a submission after the due day as late", () => {
    expect(statusOf(milestone({ submitted_at: "2026-10-11T08:00:00.000Z" }))).toEqual({
      label: "submitted, late",
      late: true,
      category: "blocked",
    })
  })

  it("keeps a late delivery marked late after the client accepts it", () => {
    const acceptedLate = milestone({ submitted_at: "2026-10-13T08:00:00.000Z", accepted_at: "2026-10-14T08:00:00.000Z" })
    const acceptedOnTime = milestone({ submitted_at: "2026-10-09T08:00:00.000Z", accepted_at: "2026-10-14T08:00:00.000Z" })

    expect(statusOf(acceptedLate).label).toBe("accepted, late")
    expect(statusOf(acceptedOnTime)).toEqual({ label: "accepted", late: false, category: "done" })
  })
})
