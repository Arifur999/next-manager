"use client"

import {
  deleteTargetAction,
  setTargetAction,
} from "@/app/(dashboardLayout)/admin/dashboard/targets/_action"
import TargetForm from "@/components/modules/Admin/Targets/TargetForm"
import TargetList from "@/components/modules/Admin/Targets/TargetList"
import { periodStart, specOf } from "@/components/modules/Admin/Targets/targetMetrics"
import ConfirmDialog from "@/components/shared/dialog/ConfirmDialog"
import { useActionMutation } from "@/hooks/useActionMutation"
import type { IKpiTarget } from "@/types/insights.types"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { usersListQuery } from "@/queries/people.queries"
import { kpiTargetsListQuery } from "@/queries/insights.queries"
import { queryKeys } from "@/lib/queryKeys"
import type { IKpiTargetFormValues } from "@/zod/insights.validation"

// Every dashboard scores against the targets, so they go stale with them.
const TARGET_KEYS = [queryKeys.kpiTargets.all, queryKeys.kpi.all]

// The numbers the company commits to; without one, every dashboard shows that
// metric as a fact with no verdict ("No target set"). The server refuses a
// percentage above 100 and says so; period_start is computed, never typed.
const TargetsBoard = () => {
  const [targetToDelete, setTargetToDelete] = useState<IKpiTarget | null>(null)

  const targetsQuery = useQuery(kpiTargetsListQuery())
  const { data: usersData } = useQuery(usersListQuery())

  const targets = targetsQuery.data?.data ?? []
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

  const handleConfirmDelete = async () => {
    if (targetToDelete && (await deleteTarget(targetToDelete.id))) setTargetToDelete(null)
  }

  // The period start is worked out here, in the browser, whose calendar
  // decides which quarter "this" one is.
  const handleSave = (values: IKpiTargetFormValues) =>
    saveTarget({ ...values, period_start: periodStart(values.period) })

  return (
    <div className="space-y-6">
      <TargetForm users={users} onSubmit={handleSave} isPending={isSaving} />

      <TargetList
        targets={targets}
        query={targetsQuery}
        onDelete={setTargetToDelete}
        isRemoving={isRemoving}
      />

      <ConfirmDialog
        open={targetToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setTargetToDelete(null)
        }}
        title="Delete this target?"
        description={
          <>
            Dashboards stop scoring{" "}
            <span className="font-medium text-foreground">
              {targetToDelete ? specOf(targetToDelete.metric).label : ""}
            </span>{" "}
            for {targetToDelete?.user?.full_name ?? "the whole agency"} against it.
          </>
        }
        variant="destructive"
        confirmLabel="Delete"
        pendingLabel="Deleting..."
        isPending={isRemoving}
        onConfirm={() => void handleConfirmDelete()}
      />
    </div>
  )
}

export default TargetsBoard
