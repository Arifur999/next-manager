"use client"

import MetricTile, { count, hours, pct } from "@/components/shared/kpi/MetricTile"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { getKpi } from "@/services/agencio.services"
import type { DeliveryKpi, DeliveryProjectRow, Metric } from "@/types/kpi.types"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"

/**
 * The project manager's screen: is the work landing when it was promised, at
 * the size it was sold.
 *
 * On-time delivery leads. Overdue milestones sit next to it as the leading
 * indicator — every one of them is an on-time rate that has not fallen yet.
 *
 * The project table is where the interesting failure lives. An agency-wide
 * plan-vs-actual of 105% can be four projects on plan and one at 200%, and the
 * average is the one number that hides it, so the rows are shown and not
 * summarised.
 */

/** Renders a Metric inside a table cell, reason and all. */
const MetricCell = ({
  metric,
  format,
  warnOver,
}: {
  metric: Metric
  format: (value: number) => string
  /** Above this, the row is worth a second look. */
  warnOver?: number
}) => {
  if (metric.value === null) {
    return (
      <span className="text-xs text-muted-foreground" title={metric.reason}>
        not measured
      </span>
    )
  }

  const flagged = warnOver !== undefined && Math.abs(metric.value) > warnOver

  return (
    <span className="flex items-center justify-end gap-1.5 tabular-nums">
      {format(metric.value)}
      {/* A word, not a colour: the badge says "over", so the state survives
          greyscale and colourblindness. */}
      {flagged && (
        <Badge variant="destructive" className="text-[10px]">
          over
        </Badge>
      )}
    </span>
  )
}

const DeliveryDashboard = ({ range }: { range: string }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["kpi", "delivery", range],
    queryFn: () => getKpi<DeliveryKpi>("delivery", range),
  })

  const kpi = data?.data as DeliveryKpi | undefined

  if (isLoading && !kpi) {
    return <div className="h-64 animate-pulse rounded-xl bg-muted/40" />
  }

  if (!kpi) {
    return (
      <p className="rounded-xl border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">
        Could not load the delivery numbers.
      </p>
    )
  }

  const projects: DeliveryProjectRow[] = kpi.projects

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <MetricTile
          label="On-time delivery"
          metric={kpi.lagging.on_time_delivery_pct}
          format={pct}
          size="lead"
          tone={1}
          hint={
            kpi.lagging.milestones_delivered === 0
              ? "Nothing delivered in this window"
              : `${kpi.lagging.milestones_on_time} of ${kpi.lagging.milestones_delivered} milestones submitted by their due date`
          }
        />

        <MetricTile
          label="Overdue milestones"
          metric={{ value: kpi.leading.overdue_milestones }}
          format={count}
          tone={2}
          hint="Past their date with nothing submitted. Each one is an on-time rate that has not fallen yet."
        />

        <MetricTile
          label="Free capacity"
          metric={{ value: kpi.leading.free_capacity_hours }}
          format={hours}
          tone={3}
          hint={`${hours(kpi.context.logged_hours)} logged of ${hours(kpi.context.available_hours)} available`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <MetricTile
          label="Utilization"
          metric={kpi.leading.utilization_pct}
          format={pct}
          tone={1}
          hint="Billable hours against available hours. 65–80% is the healthy band; above 85% means no slack for the unbilled work."
        />
        <MetricTile
          label="Awaiting acceptance"
          metric={{ value: kpi.lagging.awaiting_acceptance }}
          format={count}
          tone={2}
          hint="Submitted and not yet signed off. Delivered is not done."
        />
      </div>

      <Card className="gap-0 overflow-hidden p-0">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
          <div>
            <CardTitle className="text-base">Plan against actual</CardTitle>
            <p className="text-sm text-muted-foreground">
              Baselined projects only — a project with no baseline has no plan to be
              measured against.
            </p>
          </div>
          <Link
            href="/admin/dashboard/projects"
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            All projects
          </Link>
        </CardHeader>

        {projects.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-muted-foreground">
            No project has been baselined yet. Set baseline hours and value on a project
            to start measuring drift against what was sold.
          </p>
        ) : (
          // Its own scroller: a wide table must never make the page scroll
          // sideways.
          <div className="overflow-x-auto">
            <table className="w-full min-w-[46rem] text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="px-5 py-2.5 font-medium">Project</th>
                  <th className="px-5 py-2.5 text-right font-medium">Hours</th>
                  <th className="px-5 py-2.5 text-right font-medium">Plan vs actual</th>
                  <th className="px-5 py-2.5 text-right font-medium">Scope change</th>
                  <th className="px-5 py-2.5 text-right font-medium">Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {projects.map((project) => (
                  <tr key={project.id}>
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/dashboard/projects/${project.id}`}
                        className="font-medium underline-offset-4 hover:underline"
                      >
                        {project.name}
                      </Link>
                      <span className="ml-2 text-xs text-muted-foreground">{project.code}</span>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
                      {project.actual_hours.toFixed(1)} / {project.baseline_hours.toFixed(1)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {/* 100 is exactly on plan, so the warning is on the
                          overrun, not on the number itself. */}
                      <MetricCell metric={project.plan_vs_actual_pct} format={pct} warnOver={115} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <MetricCell
                        metric={project.scope_change_pct}
                        format={(value) => `${value > 0 ? "+" : ""}${value.toFixed(1)}%`}
                        warnOver={15}
                      />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <MetricCell metric={project.margin_pct} format={pct} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

export default DeliveryDashboard
