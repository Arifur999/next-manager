"use client"

import {
  deleteTargetAction,
  setTargetAction,
} from "@/app/(dashboardLayout)/admin/dashboard/targets/_action"
import TargetForm from "@/components/modules/Admin/Targets/TargetForm"
import { METRICS, periodStart } from "@/components/modules/Admin/Targets/targetMetrics"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import type { IKpiTarget } from "@/types/insights.types"
import { useActionMutation } from "@/hooks/useActionMutation"
import { useQuery } from "@tanstack/react-query"
import { Target as TargetIcon, Trash2 } from "lucide-react"
import { usersListQuery } from "@/queries/people.queries"
import { kpiTargetsListQuery } from "@/queries/insights.queries"
import { queryKeys } from "@/lib/queryKeys"
import type { IKpiTargetFormValues } from "@/zod/insights.validation"

// Every dashboard scores against the targets, so they go stale with them.
const TARGET_KEYS = [queryKeys.kpiTargets.all, queryKeys.kpi.all]

/**
 * The numbers the company commits to.
 *
 * Without a row here every metric on every dashboard reads "No target set" —
 * a fact with no verdict attached. 62% utilization is neither good nor bad
 * until somebody wrote down what it should have been.
 *
 * Two rules the server enforces and this screen surfaces rather than hides:
 * a percentage metric refuses a target above 100, and a period has to start
 * where its type says it does, so the picker computes period_start rather than
 * letting one be typed.
 */
const TargetsBoard = () => {
  const { data: targetsData, isLoading } = useQuery(kpiTargetsListQuery())
  const { data: usersData } = useQuery(usersListQuery())

  const targets = targetsData?.data ?? []
  const users = usersData?.data ?? []

  const { run: saveTarget, isPending: isSaving } = useActionMutation({
    action: setTargetAction,
    successMessage: "Target set",
    invalidateKeys: TARGET_KEYS,
    refresh: false,
  })

  // The row disappearing is the confirmation; there was never a toast for it.
  const { run: deleteTarget, isPending: isRemoving } = useActionMutation({
    action: deleteTargetAction,
    successMessage: false,
    invalidateKeys: TARGET_KEYS,
    refresh: false,
  })

  // The period start is worked out here, in the browser, whose calendar
  // decides which quarter "this" one is.
  const handleSave = (values: IKpiTargetFormValues) =>
    saveTarget({ ...values, period_start: periodStart(values.period) })

  const labelOf = (target: IKpiTarget) =>
    METRICS.find((entry) => entry.metric === target.metric)?.label ?? target.metric

  const unitOf = (target: IKpiTarget) =>
    METRICS.find((entry) => entry.metric === target.metric)?.unit ?? ""

  const formatValue = (target: IKpiTarget) => {
    const unit = unitOf(target)
    if (unit === "$") return `$${target.target_value.toLocaleString()}`
    return `${target.target_value}${unit}`
  }

  return (
    <div className="space-y-6">
      <TargetForm users={users} onSubmit={handleSave} isPending={isSaving} />

      <Card className="gap-0 overflow-hidden p-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle className="text-base">Current targets</CardTitle>
          <p className="text-sm text-muted-foreground">
            A dashboard only scores a metric when a target&apos;s period starts inside the
            window being viewed.
          </p>
        </CardHeader>

        {isLoading && targets.length === 0 ? (
          <div className="h-32 animate-pulse bg-muted/40" />
        ) : targets.length === 0 ? (
          <p className="flex flex-col items-center gap-2 px-6 py-12 text-center text-sm text-muted-foreground">
            <TargetIcon className="size-7" aria-hidden="true" />
            No targets yet. Every metric on every dashboard is showing a fact with no
            verdict attached.
          </p>
        ) : (
          <ul className="divide-y">
            {targets.map((target) => (
              <li
                key={target.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {labelOf(target)}
                    <span className="ml-2 font-normal text-muted-foreground">
                      {target.user?.full_name ?? "agency-wide"}
                    </span>
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {target.period} from {target.period_start.slice(0, 10)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <Badge variant="outline" className="tabular-nums">
                    {formatValue(target)}
                  </Badge>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={isRemoving}
                    onClick={() => void deleteTarget(target.id)}
                  >
                    <Trash2 className="size-3.5" />
                    <span className="sr-only">Delete target</span>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

export default TargetsBoard
