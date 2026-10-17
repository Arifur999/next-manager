import { describe, expect, it } from "vitest"
import { leaveDecisionLine } from "./leaveStatus"

describe("leaveDecisionLine", () => {
  it("says what was decided and when", () => {
    expect(leaveDecisionLine({ status: "rejected", decided_at: "2026-10-17T14:05:00" })).toBe(
      "Turned down 17 Oct 2026, 14:05",
    )
    expect(leaveDecisionLine({ status: "approved", decided_at: "2026-10-17T09:30:00" })).toBe(
      "Approved 17 Oct 2026, 09:30",
    )
  })

  it("still names the verdict when the time is missing", () => {
    expect(leaveDecisionLine({ status: "approved", decided_at: null })).toBe("Approved")
  })

  it("says nothing for a request nobody has decided", () => {
    expect(leaveDecisionLine({ status: "pending", decided_at: null })).toBeNull()
    expect(leaveDecisionLine({ status: "cancelled", decided_at: null })).toBeNull()
  })
})
