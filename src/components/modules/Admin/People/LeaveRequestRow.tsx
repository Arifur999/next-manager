"use client"

import { LEAVE_STATUS, leaveDecisionLine } from "@/components/modules/Admin/People/leaveStatus"
import StatusBadge from "@/components/shared/status/StatusBadge"
import { Button } from "@/components/ui/button"
import { formatRange } from "@/lib/dates"
import { plural } from "@/lib/text"
import type { ILeaveRequest } from "@/types/people.types"

type LeaveRequestRowProps = {
  request: ILeaveRequest
  canDecide: boolean
  isBusy: boolean
  onApprove: () => void
  onTurnDown: () => void
  onWithdraw: () => void
}

// One request: who, what and when, then the decision and its reason once there is one.
const LeaveRequestRow = ({ request, canDecide, isBusy, onApprove, onTurnDown, onWithdraw }: LeaveRequestRowProps) => {
  const status = LEAVE_STATUS[request.status]
  const decision = leaveDecisionLine(request)

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
      <div className="min-w-48 flex-1">
        <p className="flex items-center gap-2 font-medium">
          {request.user.full_name}
          <StatusBadge category={status.category} label={status.label} />
        </p>
        <p className="text-xs text-muted-foreground">
          {request.leave_type.name} · {plural(Number(request.days), "day")} ·{" "}
          {formatRange(request.from_date, request.to_date)}
          {request.reason ? ` · ${request.reason}` : ""}
        </p>
        {decision && (
          <p className="mt-1 text-xs text-muted-foreground">
            {decision}
            {request.decision_note && (
              <>
                {" · "}
                <span className="text-foreground">{request.decision_note}</span>
              </>
            )}
          </p>
        )}
      </div>

      {request.status === "pending" && (
        <div className="flex items-center gap-2">
          {canDecide && (
            <>
              <Button size="sm" disabled={isBusy} onClick={onApprove}>
                Approve
              </Button>
              <Button size="sm" variant="outline" disabled={isBusy} onClick={onTurnDown}>
                Turn down
              </Button>
            </>
          )}
          <Button size="sm" variant="ghost" disabled={isBusy} onClick={onWithdraw}>
            Withdraw
          </Button>
        </div>
      )}
    </li>
  )
}

export default LeaveRequestRow
