"use client"

import {
  createLeaveTypeAction,
  setLeaveTypeActiveAction,
} from "@/app/(dashboardLayout)/admin/dashboard/leave-settings/_action"
import EmptyState from "@/components/shared/state/EmptyState"
import AppField from "@/components/shared/form/AppField"
import PanelState from "@/components/shared/state/PanelState"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useActionMutation } from "@/hooks/useActionMutation"
import type { ILeaveType } from "@/types/people.types"
import { leaveTypeFormZodSchema, type ILeaveTypeFormValues } from "@/zod/people.validation"
import { useForm } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import { CalendarOff, Power } from "lucide-react"
import { leaveTypesQuery } from "@/queries/people.queries"
import { queryKeys } from "@/lib/queryKeys"

// A renamed or retired kind changes what the balance card can offer.
const LEAVE_TYPE_KEYS = [queryKeys.leaveTypes.all, queryKeys.leaveBalance.all]

const newLeaveType: ILeaveTypeFormValues = { name: "", days_per_year: "", is_paid: true }

// The kinds of leave. A kind is retired, never deleted, so leave approved against
// it keeps saying what it was for. Zero days means uncapped ("no limit"), not none.
const LeaveTypeBoard = () => {
  const typeList = useQuery(leaveTypesQuery())
  const types = typeList.data?.data ?? []

  const { run: addLeaveType, isPending } = useActionMutation({
    action: createLeaveTypeAction,
    successMessage: "Added",
    invalidateKeys: LEAVE_TYPE_KEYS,
    refresh: false,
  })

  const { run: toggleRetired } = useActionMutation({
    action: (type: ILeaveType) => setLeaveTypeActiveAction(type.id, { is_active: !type.is_active }),
    successMessage: "Saved",
    invalidateKeys: LEAVE_TYPE_KEYS,
    refresh: false,
  })

  const form = useForm({
    defaultValues: newLeaveType,
    validators: { onSubmit: leaveTypeFormZodSchema },
    onSubmit: async ({ value, formApi }) => {
      if (await addLeaveType(value)) formApi.reset()
    },
  })

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      <Card className="h-fit">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Add a kind</CardTitle>
        </CardHeader>

        <form
          className="space-y-4 px-6 pb-6"
          onSubmit={(event) => {
            event.preventDefault()
            void form.handleSubmit()
          }}
        >
          <form.Field name="name">
            {(field) => (
              <AppField field={field} label="Name" maxLength={60} placeholder="Study leave" disabled={isPending} />
            )}
          </form.Field>

          <form.Field name="days_per_year">
            {(field) => (
              <AppField
                field={field}
                label="Days a year"
                type="number"
                min={0}
                max={365}
                step="1"
                placeholder="0"
                disabled={isPending}
                description={
                  <>
                    Leave it at zero for a kind you want recorded but not capped — that reads as
                    &ldquo;no limit&rdquo;, not as nothing left.
                  </>
                }
              />
            )}
          </form.Field>

          <form.Field name="is_paid">
            {(field) => (
              <div className="flex items-start gap-2.5">
                <Checkbox
                  id="leave-type-paid"
                  checked={field.state.value}
                  onCheckedChange={(checked) => field.handleChange(checked === true)}
                  disabled={isPending}
                />
                <div className="grid gap-1 leading-none">
                  <Label htmlFor="leave-type-paid">Paid</Label>
                  <p className="text-xs text-muted-foreground">
                    Unpaid leave is still worth recording — it explains an absence.
                  </p>
                </div>
              </div>
            )}
          </form.Field>

          <form.Subscribe selector={(state) => state.values.name.trim() === ""}>
            {(isNameBlank) => (
              <Button type="submit" disabled={isPending || isNameBlank} className="w-full">
                Add
              </Button>
            )}
          </form.Subscribe>
        </form>
      </Card>

      <Card className="gap-0 overflow-hidden p-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle className="text-base">Kinds of leave</CardTitle>
          <p className="text-sm text-muted-foreground">
            Retiring one keeps every request already made against it — it just stops being
            offered to anybody new.
          </p>
        </CardHeader>

        <PanelState
          query={typeList}
          errorMessage="The kinds of leave did not load."
          isEmpty={types.length === 0}
          empty={
            <EmptyState icon={CalendarOff}>
              No kinds of leave yet. Nobody can ask to be away until there is one.
            </EmptyState>
          }
        >
          <ul className="divide-y">
            {types.map((type) => (
              <li
                key={type.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
              >
                <div>
                  <p className="flex items-center gap-2 font-medium">
                    {type.name}
                    {!type.is_paid && <Badge variant="outline">unpaid</Badge>}
                    {!type.is_active && <Badge variant="secondary">retired</Badge>}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {type.days_per_year === 0 ? "No limit" : `${type.days_per_year} days a year`}
                    {typeof type._count?.requests === "number"
                      ? ` · ${type._count.requests} request${
                          type._count.requests === 1 ? "" : "s"
                        }`
                      : ""}
                  </p>
                </div>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => void toggleRetired(type)}
                  aria-label={type.is_active ? `Retire ${type.name}` : `Offer ${type.name} again`}
                  title={type.is_active ? "Retire" : "Offer again"}
                >
                  <Power className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        </PanelState>
      </Card>
    </div>
  )
}

export default LeaveTypeBoard
