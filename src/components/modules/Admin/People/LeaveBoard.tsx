"use client"

import {
  cancelLeaveAction,
  decideLeaveAction,
} from "@/app/(dashboardLayout)/dashboard/leave/_action"
import LeaveBalanceCard from "@/components/modules/Admin/People/LeaveBalanceCard"
import LeaveRequestCard from "@/components/modules/Admin/People/LeaveRequestCard"
import LeaveRequestRow from "@/components/modules/Admin/People/LeaveRequestRow"
import TurnDownLeaveDialog from "@/components/modules/Admin/People/TurnDownLeaveDialog"
import EmptyState from "@/components/shared/state/EmptyState"
import PanelState from "@/components/shared/state/PanelState"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { useActionMutation } from "@/hooks/useActionMutation"
import type { ILeaveRequest } from "@/types/people.types"
import { useQuery } from "@tanstack/react-query"
import { CalendarOff } from "lucide-react"
import { useState } from "react"
import { leaveRequestsListQuery } from "@/queries/people.queries"
import { queryKeys } from "@/lib/queryKeys"

// Asking to be away, and deciding. The decide buttons follow `canDecide` from the
// page, because the API refuses everybody but an approver with a 403.

// Every change to a request moves the requester's balance too.
const LEAVE_KEYS = [queryKeys.leaveRequests.all, queryKeys.leaveBalance.all]

const LeaveBoard = ({ canDecide }: { canDecide: boolean }) => {
  const requestList = useQuery(leaveRequestsListQuery())

  const requests = requestList.data?.data ?? []
  const [turningDown, setTurningDown] = useState<ILeaveRequest | null>(null)

  // No successMessage: the server says "Leave approved" or "Leave turned down".
  const { run: decide, isPending: isDeciding } = useActionMutation({
    action: ({ id, approve, note }: { id: string; approve: boolean; note?: string }) =>
      decideLeaveAction(id, { approve, note }),
    invalidateKeys: LEAVE_KEYS,
    refresh: false,
  })

  const { run: withdraw, isPending: isWithdrawing } = useActionMutation({
    action: cancelLeaveAction,
    successMessage: "Withdrawn",
    invalidateKeys: LEAVE_KEYS,
    refresh: false,
  })

  // One change to a request at a time, so a double click cannot send it twice.
  const isBusy = isDeciding || isWithdrawing

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      <div className="space-y-4">
        <LeaveRequestCard />
        <LeaveBalanceCard />
      </div>

      <Card className="gap-0 overflow-hidden p-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle className="text-base">Requests</CardTitle>
          <p className="text-sm text-muted-foreground">
            {canDecide
              ? "Waiting ones first. Nobody decides their own."
              : "Yours, newest first."}
          </p>
        </CardHeader>

        <PanelState
          query={requestList}
          errorMessage="Leave requests did not load."
          isEmpty={requests.length === 0}
          empty={<EmptyState icon={CalendarOff}>Nothing asked for yet.</EmptyState>}
        >
          <ul className="divide-y">
            {requests.map((request) => (
              <LeaveRequestRow
                key={request.id}
                request={request}
                canDecide={canDecide}
                isBusy={isBusy}
                onApprove={() => void decide({ id: request.id, approve: true })}
                onTurnDown={() => setTurningDown(request)}
                onWithdraw={() => void withdraw(request.id)}
              />
            ))}
          </ul>
        </PanelState>
      </Card>

      <TurnDownLeaveDialog
        request={turningDown}
        onOpenChange={(open) => {
          if (!open) setTurningDown(null)
        }}
        isPending={isDeciding}
        onConfirm={(note) =>
          turningDown ? decide({ id: turningDown.id, approve: false, note }) : Promise.resolve(false)
        }
      />
    </div>
  )
}

export default LeaveBoard
