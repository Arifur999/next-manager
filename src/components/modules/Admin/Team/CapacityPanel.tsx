"use client"

import { setCapacityAction } from "@/app/(dashboardLayout)/admin/dashboard/team-management/_capacityAction"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getCapacities } from "@/services/agencio.services"
import type { ICapacityRow } from "@/types/agencio.types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"

/**
 * The two numbers every KPI divides by.
 *
 * Weekly hours is the denominator of utilization; the bill rate is what turns
 * hours into money, and realization cannot be computed at all without it.
 * Both live here rather than on the user record because they are commercial
 * settings, not identity.
 *
 * A row nobody has set shows the default and says so. That matters: a
 * utilization figure computed against an assumed 40 hours is a different kind
 * of number from one computed against a week somebody actually agreed to, and
 * the difference should not be invisible.
 */

const CapacityRow = ({ row }: { row: ICapacityRow }) => {
  const queryClient = useQueryClient()
  const [hours, setHours] = useState(String(row.weekly_hours))
  const [rate, setRate] = useState(
    // 0 means unset, so the field starts empty rather than showing a zero
    // somebody might read as "this person's time is worth nothing".
    row.standard_rate_usd > 0 ? String(row.standard_rate_usd) : "",
  )

  const { mutate: save, isPending } = useMutation({
    mutationFn: () =>
      setCapacityAction(row.user.id, {
        weekly_hours: Number(hours),
        // An empty rate field means "leave it unset", which the engine reads
        // as "no realization for this person" rather than a rate of zero.
        ...(rate.trim() === "" ? {} : { standard_rate_usd: Number(rate) }),
      }),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message || "Failed to save")
        return
      }
      toast.success(`${row.user.full_name} updated`)
      void queryClient.invalidateQueries({ queryKey: ["capacities"] })
      // Every utilization and realization figure divides by this.
      void queryClient.invalidateQueries({ queryKey: ["kpi"] })
    },
  })

  const dirty =
    Number(hours) !== row.weekly_hours ||
    (rate.trim() === "" ? row.standard_rate_usd > 0 : Number(rate) !== row.standard_rate_usd)

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
      <div className="min-w-40 flex-1">
        <p className="truncate text-sm font-medium">
          {row.user.full_name}
          {row.is_default && (
            <Badge variant="outline" className="ml-2 text-[10px] font-normal">
              default
            </Badge>
          )}
        </p>
        <p className="truncate text-xs text-muted-foreground">{row.user.email}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="sr-only sm:not-sr-only">Hours/week</span>
          <Input
            type="number"
            step="any"
            value={hours}
            onChange={(event) => setHours(event.target.value)}
            className="w-24 tabular-nums"
            disabled={isPending}
            aria-label={`Weekly hours for ${row.user.full_name}`}
          />
        </label>

        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="sr-only sm:not-sr-only">Rate $/h</span>
          <Input
            type="number"
            step="any"
            value={rate}
            onChange={(event) => setRate(event.target.value)}
            placeholder="unset"
            className="w-24 tabular-nums"
            disabled={isPending}
            aria-label={`Bill rate for ${row.user.full_name}`}
          />
        </label>

        <Button type="button" size="sm" disabled={isPending || !dirty} onClick={() => save()}>
          Save
        </Button>
      </div>
    </li>
  )
}

const CapacityPanel = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["capacities"],
    queryFn: () => getCapacities(),
  })

  const rows = (data?.data ?? []) as ICapacityRow[]
  const unrated = rows.filter((row) => row.standard_rate_usd <= 0).length

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <CardHeader className="border-b px-5 py-4">
        <CardTitle className="text-base">Capacity and rates</CardTitle>
        <p className="text-sm text-muted-foreground">
          {unrated === 0
            ? "Every person has a bill rate, so realization is computable across the agency."
            : `${unrated} of ${rows.length} have no bill rate. Realization stays uncomputed for them — the software will not guess what an hour is worth.`}
        </p>
      </CardHeader>

      {isLoading && rows.length === 0 ? (
        <div className="h-32 animate-pulse bg-muted/40" />
      ) : (
        <ul className="divide-y">
          {rows.map((row) => (
            // Keyed by user so a saved row keeps its own input state rather
            // than inheriting the next person's.
            <CapacityRow key={row.user.id} row={row} />
          ))}
        </ul>
      )}
    </Card>
  )
}

export default CapacityPanel
