"use client"

import MetricTile, { bdt, hours, pct, usd, usd2 } from "@/components/shared/kpi/MetricTile"
import { KpiRangePicker, useKpiRange } from "@/components/shared/kpi/KpiRange"
import { getKpi } from "@/services/agencio.services"
import type { AgencyKpi } from "@/types/kpi.types"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"

/**
 * Company health, above the money screen rather than replacing it.
 *
 * The existing dashboard answers "what do we hold and what are we owed" — a
 * position. This answers "where is it going", which is a different question and
 * moves earlier. Utilization and realization lead because they move six weeks
 * before revenue confirms what they already said.
 *
 * Realization is the one worth reading first. High utilization with low
 * realization is the busy-and-poor agency: the hours happened and the money
 * did not.
 */

const AgencyKpiBand = () => {
  const { preset, setPreset, query, from, to } = useKpiRange()

  const { data, isLoading } = useQuery({
    queryKey: ["kpi", "agency", query],
    queryFn: () => getKpi<AgencyKpi>("agency", query),
  })

  const kpi = data?.data as AgencyKpi | undefined

  if (isLoading && !kpi) {
    return <div className="h-48 animate-pulse rounded-xl bg-muted/40" />
  }

  if (!kpi) return null

  const { context } = kpi

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Company health</h2>
          <p className="text-sm text-muted-foreground tabular-nums">
            {from} → {to}
          </p>
        </div>
        <KpiRangePicker preset={preset} onChange={setPreset} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <MetricTile
          label="Realization"
          metric={kpi.leading.realization_pct}
          format={pct}
          size="lead"
          tone={1}
          hint="Collected money against what the billable hours were worth. Above 85% is healthy; high utilization with low realization means the hours happened and the money did not."
        />

        <MetricTile
          label="Utilization"
          metric={kpi.leading.utilization_pct}
          format={pct}
          tone={3}
          hint={
            // A denominator built mostly on assumed capacity is worth saying
            // out loud rather than presenting as a measurement.
            context.people_on_default_capacity > 0
              ? `${context.people_on_default_capacity} of ${context.headcount} on the default 40h — set their capacity to sharpen this`
              : "65–80% is the healthy band"
          }
        />

        <MetricTile
          label="Effective hourly rate"
          metric={kpi.leading.effective_hourly_rate_usd}
          format={usd2}
          tone={2}
          hint={
            context.people_with_a_bill_rate === 0
              ? "No bill rates set yet, so realization above cannot be computed"
              : `Blended bill rate ${usd2(context.blended_rate_usd)}`
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          label="Revenue collected"
          metric={kpi.lagging.revenue_usd}
          format={usd}
          tone={1}
        />
        <MetricTile
          label="Gross margin"
          metric={kpi.lagging.gross_margin_pct}
          format={pct}
          tone={3}
          // Said explicitly because everything else on this row is USD, and a
          // margin that quietly switched currency would be unreadable.
          hint={`In BDT — costs only exist in BDT. Net ${bdt(kpi.lagging.net_profit_bdt)}`}
        />
        <MetricTile
          label="Revenue per person"
          metric={kpi.lagging.annualised_revenue_per_person_usd}
          format={usd}
          tone={2}
          hint={`Annualised from this window, across ${context.headcount} people. $150k–250k is the healthy band.`}
        />
        <MetricTile
          label="Billable hours"
          metric={{ value: context.billable_hours }}
          format={hours}
          tone={1}
          hint={
            context.billable_hours > context.approved_billable_hours
              ? `${hours(context.billable_hours - context.approved_billable_hours)} still unapproved`
              : `of ${hours(context.logged_hours)} logged`
          }
        />
      </div>

      <p className="text-sm text-muted-foreground">
        Numbers without a target read as facts, not verdicts.{" "}
        <Link
          href="/admin/dashboard/targets"
          className="text-primary underline-offset-4 hover:underline"
        >
          Set targets
        </Link>{" "}
        to have these scored.
      </p>
    </section>
  )
}

export default AgencyKpiBand
