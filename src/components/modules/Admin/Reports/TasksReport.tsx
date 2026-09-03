"use client"

import EmptyState from "@/components/shared/state/EmptyState"
import LoadingBlock from "@/components/shared/state/LoadingBlock"
import StatTile from "@/components/shared/StatTile"
import { STATUS_TONE } from "@/components/shared/status/statusTone"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { getTaskReport } from "@/services/agencio.services"
import type { ITaskReport } from "@/types/agencio.types"
import { useQuery } from "@tanstack/react-query"
import { AlertTriangle, CheckCircle2, ListChecks, UserX } from "lucide-react"

/**
 * The board, added up.
 *
 * Every figure here is already on the task board; none of them has ever been
 * counted. That is the whole reason for the page — a project manager asking
 * "where is everything" should not have to read four columns by eye.
 *
 * Unassigned work gets its own row rather than being dropped, because "nobody
 * is doing eleven of these" is the most useful line on the page.
 */
const TasksReport = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["task-report"],
    queryFn: () => getTaskReport(),
  })

  const report = data?.data as ITaskReport | undefined

  if (isLoading && !report) return <LoadingBlock height="h-64" rounded />
  if (!report) return null

  if (report.total === 0) {
    return (
      <Card>
        <EmptyState icon={ListChecks}>No tasks yet, so nothing to count.</EmptyState>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Tasks"
          value={String(report.total)}
          icon={<ListChecks className="size-5" />}
          tone={1}
        />
        <StatTile
          label="Finished"
          value={String(report.done_count)}
          hint={`${Math.round((report.done_count / report.total) * 100)}% of everything`}
          icon={<CheckCircle2 className="size-5" />}
          tone={3}
        />
        <StatTile
          label="Overdue"
          value={String(report.overdue_count)}
          // Past its date AND unfinished. A task delivered late is done, and
          // counting it would make a number to chase that cannot shrink.
          hint="Past their date and still open"
          icon={<AlertTriangle className="size-5" />}
          tone={4}
        />
        <StatTile
          label="Unassigned"
          value={String(report.unassigned_count)}
          hint="Nobody is doing these"
          icon={<UserX className="size-5" />}
          tone={2}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="gap-0 overflow-hidden p-0">
          <CardHeader className="border-b px-5 py-4">
            <CardTitle className="text-base">Where everything is</CardTitle>
            <p className="text-sm text-muted-foreground">
              In board order, not alphabetically — a board is a sequence.
            </p>
          </CardHeader>

          <ul className="divide-y">
            {report.by_status.map((row) => (
              <li
                key={row.status?.id ?? "none"}
                className="flex items-center justify-between gap-3 px-5 py-3"
              >
                <span
                  className={cn(
                    "rounded px-2 py-0.5 text-xs",
                    STATUS_TONE[row.status?.category ?? "open"]
                  )}
                >
                  {row.status?.name ?? "No status"}
                </span>
                <span className="text-sm tabular-nums">{row.count}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="gap-0 overflow-hidden p-0">
          <CardHeader className="border-b px-5 py-4">
            <CardTitle className="text-base">Who is carrying it</CardTitle>
            <p className="text-sm text-muted-foreground">Most work first.</p>
          </CardHeader>

          <ul className="divide-y">
            {report.by_assignee.map((row) => (
              <li key={row.user?.id ?? "unassigned"} className="space-y-1.5 px-5 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className={cn("text-sm", !row.user && "text-muted-foreground italic")}>
                    {row.user?.full_name ?? "Nobody"}
                  </span>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {row.done} of {row.total} done
                    {row.overdue > 0 ? ` · ${row.overdue} late` : ""}
                  </span>
                </div>
                <Progress value={row.total > 0 ? (row.done / row.total) * 100 : 0} />
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}

export default TasksReport
