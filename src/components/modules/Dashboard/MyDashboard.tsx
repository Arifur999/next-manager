"use client"

import MetricTile, { count, hours, pct } from "@/components/shared/kpi/MetricTile"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { getKpi } from "@/services/agencio.services"
import type { MeKpi } from "@/types/kpi.types"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"

/**
 * One person's own week.
 *
 * Narrow on purpose. Operations sees what they did and what they owe — not the
 * agency's margin, which they cannot move and were not given the context to
 * read. A dashboard full of numbers you cannot act on trains people to stop
 * reading it.
 *
 * The gap between logged and approved is shown rather than absorbed. Approval
 * is somebody else's action, and hours sitting unapproved are hours this person
 * has done that nobody has counted yet.
 */

const MyDashboard = ({ range }: { range: string }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["kpi", "me", range],
    queryFn: () => getKpi<MeKpi>("me", range),
  })

  const kpi = data?.data as MeKpi | undefined

  if (isLoading && !kpi) {
    return <div className="h-64 animate-pulse rounded-xl bg-muted/40" />
  }

  if (!kpi) {
    return (
      <p className="rounded-xl border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">
        Could not load your numbers.
      </p>
    )
  }

  const unapproved = kpi.context.billable_hours - kpi.context.approved_billable_hours

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <MetricTile
          label="Hours logged"
          metric={{ value: kpi.context.logged_hours }}
          format={hours}
          size="lead"
          tone={1}
          hint={`${hours(kpi.context.billable_hours)} of it billable`}
        />

        <MetricTile
          label="Your utilization"
          metric={kpi.leading.utilization_pct}
          format={pct}
          tone={3}
          hint={`Against ${hours(kpi.context.available_hours)} available in this window`}
        />

        <MetricTile
          label="Open tasks"
          metric={{ value: kpi.lagging.open_tasks }}
          format={count}
          tone={2}
          hint="Assigned to you and not finished"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <MetricTile
          label="On-time submissions"
          metric={kpi.lagging.on_time_delivery_pct}
          format={pct}
          tone={1}
          hint={
            kpi.context.milestones_delivered === 0
              ? "No milestones delivered in this window"
              : `Across ${kpi.context.milestones_delivered} delivered`
          }
        />

        <MetricTile
          label="Billable hours"
          metric={kpi.leading.billable_hours}
          format={hours}
          tone={3}
        />
      </div>

      {unapproved > 0 && (
        <Card className="gap-0 p-0">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div>
              <CardTitle className="text-base">
                {hours(unapproved)} waiting on approval
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Logged and billable, not yet signed off. Nothing for you to do — approval
                is somebody else&apos;s action — but these hours are not counted anywhere
                until it happens.
              </p>
            </div>
            <Link
              href="/dashboard/timesheet"
              className="text-sm text-primary underline-offset-4 hover:underline"
            >
              Open your timesheet
            </Link>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}

export default MyDashboard
