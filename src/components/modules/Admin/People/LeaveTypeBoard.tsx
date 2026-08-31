"use client"

import {
  createLeaveTypeAction,
  updateLeaveTypeAction,
} from "@/app/(dashboardLayout)/admin/dashboard/leave-settings/_action"
import EmptyState from "@/components/shared/state/EmptyState"
import LoadingBlock from "@/components/shared/state/LoadingBlock"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getLeaveTypes } from "@/services/agencio.services"
import type { ILeaveType } from "@/types/agencio.types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CalendarOff, Power } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

/**
 * The kinds of leave an agency gives.
 *
 * A kind is retired, never deleted: leave already approved against it has to
 * keep saying what it was for, and a request pointing at a row that no longer
 * exists is a hole in somebody's record rather than a tidy list. That is why
 * there is a Power button here and no bin, unlike the category boards this
 * otherwise follows.
 *
 * Zero days means uncapped, not none. The distinction is the whole reason
 * unpaid leave works — the balance reports `null` for it and the card says "no
 * limit", where a zero allowance that refused every request would be worse than
 * not having the feature.
 */
const LeaveTypeBoard = () => {
  const queryClient = useQueryClient()
  const [name, setName] = useState("")
  const [days, setDays] = useState("")
  const [isPaid, setIsPaid] = useState(true)

  const { data, isLoading } = useQuery({ queryKey: ["leave-types"], queryFn: () => getLeaveTypes() })
  const types = (data?.data ?? []) as ILeaveType[]

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["leave-types"] })
    // A renamed or retired kind changes what the balance card can offer.
    void queryClient.invalidateQueries({ queryKey: ["leave-balance"] })
  }

  const { mutate: add, isPending } = useMutation({
    mutationFn: () =>
      createLeaveTypeAction({
        name: name.trim(),
        days_per_year: Number(days || 0),
        is_paid: isPaid,
      }),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message || "Could not add it")
        return
      }
      toast.success("Added")
      setName("")
      setDays("")
      setIsPaid(true)
      refresh()
    },
  })

  const { mutate: toggle } = useMutation({
    mutationFn: (type: ILeaveType) =>
      updateLeaveTypeAction(type.id, { is_active: !type.is_active }),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message || "Could not update it")
        return
      }
      toast.success("Saved")
      refresh()
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
            if (!name.trim()) return
            add()
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="leave-type-name">Name</Label>
            <Input
              id="leave-type-name"
              value={name}
              maxLength={60}
              onChange={(event) => setName(event.target.value)}
              placeholder="Study leave"
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="leave-type-days">Days a year</Label>
            <Input
              id="leave-type-days"
              type="number"
              min={0}
              max={365}
              step="1"
              value={days}
              placeholder="0"
              onChange={(event) => setDays(event.target.value)}
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">
              Leave it at zero for a kind you want recorded but not capped — that reads as
              &ldquo;no limit&rdquo;, not as nothing left.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <Checkbox
              id="leave-type-paid"
              checked={isPaid}
              onCheckedChange={(checked) => setIsPaid(checked === true)}
              disabled={isPending}
            />
            <div className="grid gap-1 leading-none">
              <Label htmlFor="leave-type-paid">Paid</Label>
              <p className="text-xs text-muted-foreground">
                Unpaid leave is still worth recording — it explains an absence.
              </p>
            </div>
          </div>

          <Button type="submit" disabled={isPending || !name.trim()} className="w-full">
            Add
          </Button>
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

        {isLoading && types.length === 0 ? (
          <LoadingBlock />
        ) : types.length === 0 ? (
          <EmptyState icon={CalendarOff}>
            No kinds of leave yet. Nobody can ask to be away until there is one.
          </EmptyState>
        ) : (
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
                  onClick={() => toggle(type)}
                  aria-label={type.is_active ? `Retire ${type.name}` : `Offer ${type.name} again`}
                  title={type.is_active ? "Retire" : "Offer again"}
                >
                  <Power className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

export default LeaveTypeBoard
