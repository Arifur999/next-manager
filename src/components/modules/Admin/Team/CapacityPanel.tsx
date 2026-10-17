"use client"

import { setCapacityAction } from "@/app/(dashboardLayout)/admin/dashboard/team-management/_capacityAction"
import EmptyState from "@/components/shared/state/EmptyState"
import ErrorState from "@/components/shared/state/ErrorState"
import LoadingBlock from "@/components/shared/state/LoadingBlock"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useActionMutation } from "@/hooks/useActionMutation"
import type { ICapacityRow } from "@/types/work.types"
import type { ICapacityFormValues } from "@/zod/people.validation"
import { useQuery } from "@tanstack/react-query"
import { UsersRound } from "lucide-react"
import { useState } from "react"
import { capacitiesQuery } from "@/queries/work.queries"
import { queryKeys } from "@/lib/queryKeys"

// Weekly hours and bill rate, the denominators of utilization and realization. A
// row nobody has set is badged "default", so an assumed week never reads as agreed.

const CapacityRow = ({ row }: { row: ICapacityRow }) => {
  const [hours, setHours] = useState(String(row.weekly_hours))
  const [rate, setRate] = useState(
    // 0 means unset, so the field starts empty rather than showing a zero
    // somebody might read as "this person's time is worth nothing".
    row.standard_rate_usd > 0 ? String(row.standard_rate_usd) : "",
  )

  const { run: saveCapacity, isPending } = useActionMutation({
    action: (values: ICapacityFormValues) => setCapacityAction(row.user.id, values),
    successMessage: `${row.user.full_name} updated`,
    // Every utilization and realization figure divides by this.
    invalidateKeys: [queryKeys.capacities.all, queryKeys.kpi.all],
    refresh: false,
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

        <Button
          type="button"
          size="sm"
          disabled={isPending || !dirty}
          onClick={() => void saveCapacity({ weekly_hours: hours, standard_rate_usd: rate })}
        >
          Save
        </Button>
      </div>
    </li>
  )
}

const CapacityPanel = () => {
  const capacityList = useQuery(capacitiesQuery())

  const capacities = capacityList.data?.data ?? []
  const unrated = capacities.filter((capacity) => capacity.standard_rate_usd <= 0).length

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <CardHeader className="border-b px-5 py-4">
        <CardTitle className="text-base">Capacity and rates</CardTitle>
        {capacities.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {unrated === 0
              ? "Every person has a bill rate, so realization is computable across the agency."
              : `${unrated} of ${capacities.length} have no bill rate. Realization stays uncomputed for them — the software will not guess what an hour is worth.`}
          </p>
        )}
      </CardHeader>

      {/* The error shows only when nothing loaded: each row holds figures
          being typed, and a failed refetch must not take them away. */}
      {capacityList.isError && capacities.length === 0 && (
        <ErrorState
          message="Capacities did not load."
          onRetry={() => void capacityList.refetch()}
          isRetrying={capacityList.isFetching}
        />
      )}

      {capacityList.isLoading && <LoadingBlock height="h-32" />}

      {capacityList.isSuccess && capacities.length === 0 && (
        <EmptyState icon={UsersRound}>Nobody on the team yet.</EmptyState>
      )}

      {capacities.length > 0 && (
        <ul className="divide-y">
          {capacities.map((row) => (
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
