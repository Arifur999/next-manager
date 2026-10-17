"use client"

import {
  deleteTargetAction,
  setTargetAction,
} from "@/app/(dashboardLayout)/admin/dashboard/targets/_action"
import TargetForm from "@/components/modules/Admin/Targets/TargetForm"
import TargetList from "@/components/modules/Admin/Targets/TargetList"
import { periodStart } from "@/components/modules/Admin/Targets/targetMetrics"
import { useActionMutation } from "@/hooks/useActionMutation"
import { useQuery } from "@tanstack/react-query"
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

  return (
    <div className="space-y-6">
      <TargetForm users={users} onSubmit={handleSave} isPending={isSaving} />

      <TargetList
        targets={targets}
        isLoading={isLoading}
        onDelete={(id) => void deleteTarget(id)}
        isRemoving={isRemoving}
      />
    </div>
  )
}

export default TargetsBoard
