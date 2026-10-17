"use client"

import EmptyState from "@/components/shared/state/EmptyState"
import PanelState from "@/components/shared/state/PanelState"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { roleTitle } from "@/types/permission.types"
import { useQuery } from "@tanstack/react-query"
import { format, parseISO } from "date-fns"
import { UsersRound } from "lucide-react"
import { workloadQuery } from "@/queries/work.queries"

// Hours logged ("load") or left ("free"): one query read from either end, so the two
// screens never disagree about a week. A capacity nobody entered is badged as assumed.
const WorkloadBoard = ({ mode }: { mode: "load" | "free" }) => {
  const workloadResult = useQuery(workloadQuery())
  const workload = workloadResult.data?.data
  const rows = workload?.rows ?? []

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <CardHeader className="border-b px-5 py-4">
        <CardTitle className="text-base">
          {mode === "load" ? "Hours logged" : "Hours left"}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {workload
            ? `${format(parseISO(workload.from), "d MMM")} – ${format(parseISO(workload.to), "d MMM yyyy")} · counted as logged, not as approved, because approval comes days later and you need to know now.`
            : "The last seven days."}
        </p>
      </CardHeader>

      <PanelState
        query={workloadResult}
        errorMessage="Workload did not load."
        isEmpty={rows.length === 0}
        empty={<EmptyState icon={UsersRound}>Nobody on the team yet.</EmptyState>}
      >
        <ul className="divide-y">
          {rows.map((row) => {
            // Over 100% is real and worth seeing, so the bar is clamped for
            // drawing while the number beside it is not.
            const pct = row.utilization_pct ?? 0
            const over = pct > 100

            return (
              <li key={row.user.id} className="space-y-2 px-5 py-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 font-medium">
                      {row.user.full_name}
                      {row.is_default && (
                        <Badge variant="outline" className="text-[10px]">
                          assumed {row.weekly_hours}h/week
                        </Badge>
                      )}
                      {row.leave_days > 0 && (
                        <Badge variant="secondary" className="text-[10px]">
                          {row.leave_days} {row.leave_days === 1 ? "day" : "days"} away
                        </Badge>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {roleTitle(row.user.role)}
                      {row.user.department?.name ? ` · ${row.user.department.name}` : ""}
                    </p>
                  </div>

                  <span className={cn("text-sm tabular-nums", over && "text-destructive")}>
                    {mode === "load"
                      ? `${row.logged_hours} of ${row.available_hours}h`
                      : `${row.remaining_hours}h left`}
                  </span>
                </div>

                <Progress value={Math.min(pct, 100)} className={cn(over && "[&>div]:bg-destructive")} />

                <p className="text-xs text-muted-foreground">
                  {row.utilization_pct === null
                    ? "No capacity recorded, so there is nothing to measure against."
                    : `${row.utilization_pct}% of the hours available`}
                </p>
              </li>
            )
          })}
        </ul>
      </PanelState>
    </Card>
  )
}

export default WorkloadBoard
