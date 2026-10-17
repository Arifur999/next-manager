"use client"

import {
  cancelLeaveAction,
  decideLeaveAction,
  requestLeaveAction,
} from "@/app/(dashboardLayout)/dashboard/leave/_action"
import LeaveBalanceCard from "@/components/modules/Admin/People/LeaveBalanceCard"
import EmptyState from "@/components/shared/state/EmptyState"
import LoadingBlock from "@/components/shared/state/LoadingBlock"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useActionMutation } from "@/hooks/useActionMutation"
import type { LeaveStatus } from "@/types/people.types"
import {
  leaveRequestFormZodSchema,
  suggestedLeaveDays,
  type ILeaveRequestFormValues,
} from "@/zod/people.validation"
import { useForm, useStore } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import { format, parseISO } from "date-fns"
import { CalendarOff } from "lucide-react"
import { leaveRequestsListQuery, leaveTypesQuery } from "@/queries/people.queries"
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

const newLeaveRequest: ILeaveRequestFormValues = {
  leave_type_id: "",
  from_date: "",
  to_date: "",
  days: "",
  reason: "",
}

const LeaveBoard = ({ canDecide }: { canDecide: boolean }) => {
  const { data, isLoading } = useQuery(leaveRequestsListQuery())
  const { data: typeData } = useQuery(leaveTypesQuery())

  const requests = data?.data ?? []
  const types = ((typeData?.data ?? [])).filter((type) => type.is_active)

  const { run: requestLeave, isPending } = useActionMutation({
    action: requestLeaveAction,
    successMessage: "Sent for approval",
    invalidateKeys: LEAVE_KEYS,
    refresh: false,
  })

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

  const form = useForm({
    defaultValues: newLeaveRequest,
    validators: { onSubmit: leaveRequestFormZodSchema },
    onSubmit: async ({ value, formApi }) => {
      // Everything but the kind clears once the request is sent.
      if (await requestLeave(value)) {
        formApi.reset({ ...newLeaveRequest, leave_type_id: value.leave_type_id }, { keepDefaultValues: true })
      }
    },
  })

  const suggestedDays = useStore(form.store, (state) =>
    suggestedLeaveDays(state.values.from_date, state.values.to_date),
  )
  const isIncomplete = useStore(
    form.store,
    (state) => !state.values.leave_type_id || !state.values.from_date || !state.values.to_date,
  )

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      <div className="space-y-4">
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Ask for leave</CardTitle>
          </CardHeader>

          <form
            className="space-y-4 px-6 pb-6"
            onSubmit={(event) => {
              event.preventDefault()
              void form.handleSubmit()
            }}
          >
            <form.Field name="leave_type_id">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor="leave-type">Kind</Label>
                  <Select value={field.state.value} onValueChange={field.handleChange} disabled={isPending}>
                    <SelectTrigger id="leave-type" className="w-full">
                      <SelectValue placeholder="Choose" />
                    </SelectTrigger>
                    <SelectContent>
                      {types.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                          {type.is_paid ? "" : " (unpaid)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <form.Field name="from_date">
                {(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor="leave-from">First day</Label>
                    <Input
                      id="leave-from"
                      type="date"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      disabled={isPending}
                    />
                  </div>
                )}
              </form.Field>
              <form.Field name="to_date">
                {(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor="leave-to">Last day</Label>
                    <Input
                      id="leave-to"
                      type="date"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      disabled={isPending}
                    />
                  </div>
                )}
              </form.Field>
            </div>

            <form.Field name="days">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor="leave-days">Days it costs</Label>
                  <Input
                    id="leave-days"
                    type="number"
                    min={0.5}
                    step="0.5"
                    value={field.state.value}
                    placeholder={String(suggestedDays)}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    disabled={isPending}
                  />
                  <p className="text-xs text-muted-foreground">
                    {/* The dates cannot know about weekends or half days, so the
                        number is editable and it is the one that is stored. */}
                    Counted from the dates, but yours to change — weekends and half days are
                    your agency&apos;s business, not ours.
                  </p>
                </div>
              )}
            </form.Field>

            <form.Field name="reason">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor="leave-reason">Reason</Label>
                  <Input
                    id="leave-reason"
                    value={field.state.value}
                    maxLength={300}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder="Optional"
                    disabled={isPending}
                  />
                </div>
              )}
            </form.Field>

            <Button type="submit" disabled={isPending || isIncomplete} className="w-full">
              Send for approval
            </Button>
          </form>
        </Card>

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

        {isLoading && requests.length === 0 ? (
          <LoadingBlock />
        ) : requests.length === 0 ? (
          <EmptyState icon={CalendarOff}>Nothing asked for yet.</EmptyState>
        ) : (
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
        )}
      </Card>
    </div>
  )
}

export default LeaveBoard
