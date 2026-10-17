"use client"

import EditTargetValueForm from "@/components/modules/Admin/Targets/EditTargetValueForm"
import { specOf } from "@/components/modules/Admin/Targets/targetMetrics"
import EmptyState from "@/components/shared/state/EmptyState"
import PanelState from "@/components/shared/state/PanelState"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { formatUsd } from "@/lib/currency"
import { formatDay } from "@/lib/dates"
import type { IKpiTarget } from "@/types/insights.types"
import type { IKpiTargetValueFormValues } from "@/zod/insights.validation"
import type { UseQueryResult } from "@tanstack/react-query"
import { Pencil, Target as TargetIcon, Trash2 } from "lucide-react"
import { useState } from "react"

type TargetListProps = {
  targets: IKpiTarget[]
  query: Pick<UseQueryResult, "isError" | "isLoading" | "isFetching" | "refetch">
  onDelete: (target: IKpiTarget) => void
  onSave: (target: IKpiTarget, values: IKpiTargetValueFormValues) => Promise<boolean>
  isBusy: boolean
}

const TargetList = ({ targets, query, onDelete, onSave, isBusy }: TargetListProps) => {
  const [editingId, setEditingId] = useState<string | null>(null)

  const formatValue = (target: IKpiTarget) => {
    const { unit } = specOf(target.metric)
    if (unit === "$") return formatUsd(target.target_value)
    return `${target.target_value}${unit}`
  }

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <CardHeader className="border-b px-5 py-4">
        <CardTitle className="text-base">Current targets</CardTitle>
        <p className="text-sm text-muted-foreground">
          A dashboard only scores a metric when a target&apos;s period starts inside the
          window being viewed.
        </p>
      </CardHeader>

      <PanelState
        query={query}
        errorMessage="Targets did not load."
        isEmpty={targets.length === 0}
        empty={
          <EmptyState icon={TargetIcon}>
            No targets yet. Every metric on every dashboard is showing a fact with no
            verdict attached.
          </EmptyState>
        }
      >
        <ul className="divide-y">
          {targets.map((target) => (
            <li
              key={target.id}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {specOf(target.metric).label}
                  <span className="ml-2 font-normal text-muted-foreground">
                    {target.user?.full_name ?? "agency-wide"}
                  </span>
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {target.period} from {formatDay(target.period_start.slice(0, 10))}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                {editingId === target.id ? (
                  <EditTargetValueForm
                    target={target}
                    label={`New target for ${specOf(target.metric).label}`}
                    isPending={isBusy}
                    onSave={(values) => onSave(target, values)}
                    onDone={() => setEditingId(null)}
                  />
                ) : (
                  <>
                    <Badge variant="outline" className="tabular-nums">
                      {formatValue(target)}
                    </Badge>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isBusy}
                      onClick={() => setEditingId(target.id)}
                    >
                      <Pencil className="size-3.5" />
                      <span className="sr-only">Change the target</span>
                    </Button>
                  </>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isBusy}
                  onClick={() => onDelete(target)}
                >
                  <Trash2 className="size-3.5" />
                  <span className="sr-only">Delete target</span>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </PanelState>
    </Card>
  )
}

export default TargetList
