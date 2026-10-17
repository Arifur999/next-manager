"use client"

import {
  cancelLeaveAction,
  decideLeaveAction,
} from "@/app/(dashboardLayout)/dashboard/leave/_action"
import LeaveBalanceCard from "@/components/modules/Admin/People/LeaveBalanceCard"
import LeaveRequestCard from "@/components/modules/Admin/People/LeaveRequestCard"
import EmptyState from "@/components/shared/state/EmptyState"
import PanelState from "@/components/shared/state/PanelState"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { useActionMutation } from "@/hooks/useActionMutation"
import type { LeaveStatus } from "@/types/people.types"
import { useQuery } from "@tanstack/react-query"
import { format, parseISO } from "date-fns"
import { CalendarOff } from "lucide-react"
import { leaveRequestsListQuery } from "@/queries/people.queries"
import { queryKeys } from "@/lib/queryKeys"

/**
 * Asking to be away, and deciding.
 *
 * Whether the decide buttons appear is decided by the API, not by this
 * component reading the viewer's role: an approver gets 200 and everybody else
 * gets 403, so showing the buttons to somebody who cannot use them would only
 * teach them the app is broken. They are shown when `canDecide` is passed in,
 * which the page knows from the role it rendered for.
 */

const STATUS_TONE: Record<LeaveStatus, "secondary" | "outline" | "destructive"> = {
  pending: "outline",
  approved: "secondary",
  rejected: "destructive",
  cancelled: "outline",
}

// Every change to a request moves the requester's balance too.
const LEAVE_KEYS = [queryKeys.leaveRequests.all, queryKeys.leaveBalance.all]

const LeaveBoard = ({ canDecide }: { canDecide: boolean }) => {
  const requestList = useQuery(leaveRequestsListQuery())

  const requests = requestList.data?.data ?? []

  // No successMessage: the server says "Leave approved" or "Leave turned down".
  const { run: decide } = useActionMutation({
    action: ({ id, approve }: { id: string; approve: boolean }) => decideLeaveAction(id, { approve }),
    invalidateKeys: LEAVE_KEYS,
    refresh: false,
  })

  const { run: withdraw } = useActionMutation({
    action: cancelLeaveAction,
    successMessage: "Withdrawn",
    invalidateKeys: LEAVE_KEYS,
    refresh: false,
  })

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
              <li
                key={request.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
              >
                <div className="min-w-48 flex-1">
                  <p className="flex items-center gap-2 font-medium">
                    {request.user.full_name}
                    <Badge variant={STATUS_TONE[request.status]}>{request.status}</Badge>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {request.leave_type.name} · {request.days} day
                    {Number(request.days) === 1 ? "" : "s"} ·{" "}
                    {format(parseISO(request.from_date), "d MMM")} –{" "}
                    {format(parseISO(request.to_date), "d MMM yyyy")}
                    {request.reason ? ` · ${request.reason}` : ""}
                  </p>
                </div>

                {request.status === "pending" && (
                  <div className="flex items-center gap-2">
                    {canDecide && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => void decide({ id: request.id, approve: true })}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => void decide({ id: request.id, approve: false })}
                        >
                          Turn down
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => void withdraw(request.id)}>
                      Withdraw
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </PanelState>
      </Card>
    </div>
  )
}

export default LeaveBoard
