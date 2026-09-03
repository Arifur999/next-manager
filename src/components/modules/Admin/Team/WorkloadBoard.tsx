"use client"

import EmptyState from "@/components/shared/state/EmptyState"
import LoadingBlock from "@/components/shared/state/LoadingBlock"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { getWorkload } from "@/services/agencio.services"
import type { IWorkload } from "@/types/agencio.types"
import { useQuery } from "@tanstack/react-query"
import { format, parseISO } from "date-fns"
import { UsersRound } from "lucide-react"

/**
 * Who is carrying what, and what is left of them.
 *
 * Two readings of one query. `mode="load"` shows the hours going in;
 * `mode="free"` shows the hours left over. They are the same subtraction from
 * opposite ends, which is why they come from one endpoint — computing them
 * apart is how two screens end up disagreeing about one person's week.
 *
 * A capacity nobody entered is marked as assumed rather than shown as fact.
 * The default of 40 is applied deliberately so a company that never opened the
 * capacity screen still gets a figure, but a reader deciding who to give work
 * to deserves to know which denominators were guessed.
 */
const WorkloadBoard = ({ mode }: { mode: "load" | "free" }) => {
  const { data, isLoading } = useQuery({ queryKey: ["workload"], queryFn: () => getWorkload() })
  const workload = data?.data as IWorkload | undefined
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

      {isLoading && rows.length === 0 ? (
        <LoadingBlock />
      ) : rows.length === 0 ? (
        <EmptyState icon={UsersRound}>Nobody on the team yet.</EmptyState>
      ) : (
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
                    <p className="text-xs capitalize text-muted-foreground">
                      {row.user.role.replace(/_/g, " ")}
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
      )}
    </Card>
  )
}

export default WorkloadBoard
