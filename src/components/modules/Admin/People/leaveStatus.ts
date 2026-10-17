import { formatDateTime } from "@/lib/dates"
import type { ILeaveRequest, LeaveStatus } from "@/types/people.types"
import type { StatusCategory } from "@/types/common.types"

// A leave status in the words the board uses, with the meaning StatusBadge styles.
export const LEAVE_STATUS: Record<LeaveStatus, { category: StatusCategory; label: string }> = {
  pending: { category: "blocked", label: "Waiting" },
  approved: { category: "done", label: "Approved" },
  rejected: { category: "cancelled", label: "Turned down" },
  cancelled: { category: "open", label: "Withdrawn" },
}

// "Turned down 17 Oct 2026, 14:05": what was decided and when, for the person who asked.
export const leaveDecisionLine = (request: Pick<ILeaveRequest, "status" | "decided_at">): string | null => {
  if (request.status !== "approved" && request.status !== "rejected") return null

  const verdict = LEAVE_STATUS[request.status].label
  return request.decided_at ? `${verdict} ${formatDateTime(request.decided_at)}` : verdict
}
