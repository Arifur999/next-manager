"use client"

import { requestLeaveAction } from "@/app/(dashboardLayout)/dashboard/leave/_action"
import AppField from "@/components/shared/form/AppField"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useActionMutation } from "@/hooks/useActionMutation"
import {
  leaveRequestFormZodSchema,
  suggestedLeaveDays,
  type ILeaveRequestFormValues,
} from "@/zod/people.validation"
import { useForm, useStore } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import { leaveTypesQuery } from "@/queries/people.queries"
import { queryKeys } from "@/lib/queryKeys"

const newLeaveRequest: ILeaveRequestFormValues = {
  leave_type_id: "",
  from_date: "",
  to_date: "",
  days: "",
  reason: "",
}

// Asking to be away: the form half of the leave board.
const LeaveRequestCard = () => {
  const typeList = useQuery(leaveTypesQuery())
  const types = (typeList.data?.data ?? []).filter((type) => type.is_active)

  const { run: requestLeave, isPending } = useActionMutation({
    action: requestLeaveAction,
    successMessage: "Sent for approval",
    // A new request moves the requester's balance too.
    invalidateKeys: [queryKeys.leaveRequests.all, queryKeys.leaveBalance.all],
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
            {(field) => <AppField field={field} label="First day" type="date" disabled={isPending} />}
          </form.Field>
          <form.Field name="to_date">
            {(field) => <AppField field={field} label="Last day" type="date" disabled={isPending} />}
          </form.Field>
        </div>

        <form.Field name="days">
          {(field) => (
            <AppField
              field={field}
              label="Days it costs"
              type="number"
              min={0.5}
              step="0.5"
              placeholder={String(suggestedDays)}
              disabled={isPending}
              description={
                <>
                  Counted from the dates, but yours to change — weekends and half days are
                  your agency&apos;s business, not ours.
                </>
              }
            />
          )}
        </form.Field>

        <form.Field name="reason">
          {(field) => (
            <AppField field={field} label="Reason" maxLength={300} placeholder="Optional" disabled={isPending} />
          )}
        </form.Field>

        <Button type="submit" disabled={isPending || isIncomplete} className="w-full">
          Send for approval
        </Button>
      </form>
    </Card>
  )
}

export default LeaveRequestCard
