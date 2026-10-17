"use client"

import { specOf } from "@/components/modules/Admin/Targets/targetMetrics"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import type { IKpiTarget } from "@/types/insights.types"
import { Target as TargetIcon, Trash2 } from "lucide-react"

const TargetList = ({
  targets,
  isLoading,
  onDelete,
  isRemoving,
}: {
  targets: IKpiTarget[]
  isLoading: boolean
  onDelete: (id: string) => void
  isRemoving: boolean
}) => {
  const formatValue = (target: IKpiTarget) => {
    const { unit } = specOf(target.metric)
    if (unit === "$") return `$${target.target_value.toLocaleString()}`
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
                  {specOf(target.metric).label}
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
                  onClick={() => onDelete(target.id)}
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
  )
}

export default TargetList
