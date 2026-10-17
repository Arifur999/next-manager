"use client"

import { recordAttendanceAction } from "@/app/(dashboardLayout)/dashboard/attendance/_action"
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
import { attendanceFormZodSchema, type IAttendanceFormValues } from "@/zod/people.validation"
import { useForm, useStore } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { usersListQuery } from "@/queries/people.queries"
import { queryKeys } from "@/lib/queryKeys"

const newAttendanceDay = (): IAttendanceFormValues => ({
  user_id: "",
  date: format(new Date(), "yyyy-MM-dd"),
  check_in: "",
  check_out: "",
})

// Writing down somebody else's day. The server files it as `admin`, not `self`:
// "they clocked in" and "somebody wrote it down" are different claims.
const RecordAttendanceCard = () => {
  const memberList = useQuery(usersListQuery())
  const members = (memberList.data?.data ?? []).filter((member) => member.status === "active")

  // A refusal such as "Check-out has to be after check-in" keeps what was typed.
  const { run: recordDay, isPending } = useActionMutation({
    action: recordAttendanceAction,
    successMessage: "Recorded",
    invalidateKeys: [queryKeys.attendance.all],
    refresh: false,
  })

  const form = useForm({
    defaultValues: newAttendanceDay(),
    validators: { onSubmit: attendanceFormZodSchema },
    onSubmit: async ({ value, formApi }) => {
      if (await recordDay(value)) {
        formApi.setFieldValue("check_in", "")
        formApi.setFieldValue("check_out", "")
      }
    },
  })

  const isIncomplete = useStore(form.store, (state) => !state.values.user_id || !state.values.date)

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Record it for somebody</CardTitle>
        <p className="text-sm text-muted-foreground">
          For the morning somebody forgot, or was at a client&apos;s. It is filed as
          recorded by you, not as them clocking in.
        </p>
      </CardHeader>

      <form
        className="space-y-4 px-6 pb-6"
        onSubmit={(event) => {
          event.preventDefault()
          void form.handleSubmit()
        }}
      >
        <form.Field name="user_id">
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor="attendance-user">Who</Label>
              <Select value={field.state.value} onValueChange={field.handleChange} disabled={isPending}>
                <SelectTrigger id="attendance-user" className="w-full">
                  <SelectValue placeholder="Choose" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </form.Field>

        <form.Field name="date">
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor="attendance-date">Day</Label>
              <Input
                id="attendance-date"
                type="date"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                disabled={isPending}
              />
            </div>
          )}
        </form.Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <form.Field name="check_in">
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor="attendance-in">In</Label>
                <Input
                  id="attendance-in"
                  type="time"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  disabled={isPending}
                />
              </div>
            )}
          </form.Field>
          <form.Field name="check_out">
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor="attendance-out">Out</Label>
                <Input
                  id="attendance-out"
                  type="time"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  disabled={isPending}
                />
              </div>
            )}
          </form.Field>
        </div>

        <p className="text-xs text-muted-foreground">
          Leave a time empty for one that is genuinely not known — blank stays &ldquo;not
          recorded&rdquo; rather than becoming midnight.
        </p>

        <Button type="submit" disabled={isPending || isIncomplete} className="w-full">
          Record
        </Button>
      </form>
    </Card>
  )
}

export default RecordAttendanceCard
