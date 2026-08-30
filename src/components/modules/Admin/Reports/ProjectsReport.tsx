"use client"

import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { formatBdt } from "@/lib/currency"
import { getProjectProfitability } from "@/services/agencio.services"
import { useQuery } from "@tanstack/react-query"

/**
 * Which projects made money.
 *
 * Money received minus money spent, per project. Unpaid work is not profit — a
 * project ranked on what it was contracted for would put the one that never
 * paid at the top.
 */

type ProjectRow = {
  project: { id: string; name: string; code: string }
  received_bdt_reporting: number
  total_cost_bdt: number
  profit_bdt: number
  margin_pct: number
}

const ProjectsReport = () => {
  const { data } = useQuery({
    queryKey: ["report-project-profitability"],
    queryFn: () => getProjectProfitability(),
  })

  const projects = (data?.data ?? []) as ProjectRow[]

  // Nominal categories — project names have no inherent order — so every bar
  // takes the SAME slot-1 hue. Colouring them by value would spend the identity
  // channel re-encoding what the bar length already shows.
  const widest = Math.max(...projects.map((row) => Math.abs(row.profit_bdt)), 1)

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <CardHeader className="border-b px-5 py-4">
        <CardTitle className="text-base">Project profitability</CardTitle>
        <p className="text-sm text-muted-foreground">
          Money received minus money spent, per project. Unpaid work is not profit.
        </p>
      </CardHeader>

      {projects.length === 0 ? (
        <p className="px-5 py-12 text-center text-sm text-muted-foreground">
          No projects with recorded money yet.
        </p>
      ) : (
        <ul className="divide-y">
          {projects.map((row) => {
            const width = (Math.abs(row.profit_bdt) / widest) * 100
            const isLoss = row.profit_bdt < 0

            return (
              <li key={row.project.id} className="px-5 py-3.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{row.project.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {formatBdt(row.received_bdt_reporting)} in ·{" "}
                      {formatBdt(row.total_cost_bdt)} out
                    </p>
                  </div>

                  {/* Direct label on every row, which is what the contrast
                      relief requires — and there are few enough rows that it
                      does not become noise. */}
                  <span className="shrink-0 text-sm font-medium tabular-nums">
                    {formatBdt(row.profit_bdt)}
                  </span>
                </div>

                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    // A loss is a different STATE, not a different series, so it
                    // takes the destructive status colour rather than another
                    // categorical hue.
                    className={`h-full rounded-full ${isLoss ? "bg-destructive" : "bg-chart-1"}`}
                    style={{ width: `${width}%` }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}

export default ProjectsReport
