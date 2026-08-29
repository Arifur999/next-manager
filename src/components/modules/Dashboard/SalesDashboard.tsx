"use client"

import MetricTile, {
  count,
  days,
  pct,
  times,
  usd,
} from "@/components/shared/kpi/MetricTile"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { getKpi } from "@/services/agencio.services"
import type { SalesKpi } from "@/types/kpi.types"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"

/**
 * The salesperson's own screen.
 *
 * Pipeline coverage leads, and gets the big tile. It is the only number here
 * that moves before the quarter is decided — win rate and cycle length are
 * verdicts on work already done, and by the time they move it is too late to
 * act on them.
 *
 * Deliberately not here: revenue collected, margin, anything about cost. A
 * salesperson cannot move those, and a dashboard full of numbers you cannot
 * act on trains people to stop reading it.
 */

const SalesDashboard = ({ range }: { range: string }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["kpi", "sales", range],
    queryFn: () => getKpi<SalesKpi>("sales", range),
  })

  const kpi = data?.data as SalesKpi | undefined

  if (isLoading && !kpi) {
    return <div className="h-64 animate-pulse rounded-xl bg-muted/40" />
  }

  if (!kpi) {
    return (
      <p className="rounded-xl border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">
        Could not load the pipeline numbers.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <MetricTile
          label="Pipeline coverage"
          metric={kpi.leading.pipeline_coverage}
          format={times}
          size="lead"
          tone={1}
          hint="Open pipeline against the revenue target it has to produce. Three to four times over is the shape of a healthy one."
        />

        <MetricTile
          label="Pipeline velocity"
          metric={kpi.leading.pipeline_velocity_usd_per_day}
          format={(value) => `${usd(value)}/day`}
          tone={3}
          hint="Open deals × win rate × average size, over the cycle length."
        />

        <MetricTile
          label="Open pipeline"
          metric={{ value: kpi.context.open_pipeline_usd }}
          format={usd}
          tone={2}
          hint={`${kpi.context.open_deals} deals still live`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          label="Win rate"
          metric={kpi.lagging.win_rate_pct}
          format={pct}
          tone={1}
          hint={`Of ${(kpi.lagging.deals_won.value ?? 0) + kpi.context.deals_lost} deals decided in this window`}
        />
        <MetricTile label="Deals won" metric={kpi.lagging.deals_won} format={count} tone={3} />
        <MetricTile
          label="Won value"
          metric={kpi.lagging.deal_value_usd}
          format={usd}
          tone={2}
          hint="Estimated value of the deals that landed"
        />
        <MetricTile
          label="Average deal"
          metric={kpi.lagging.average_deal_size_usd}
          format={usd}
          tone={1}
        />
      </div>

      <Card className="gap-0 p-0">
        <CardHeader className="flex flex-row items-center justify-between gap-3 border-b px-5 py-4">
          <div>
            <CardTitle className="text-base">Sales cycle</CardTitle>
            <p className="text-sm text-muted-foreground">
              First recorded stage to the day the deal landed.
            </p>
          </div>
          <Link
            href="/admin/dashboard/leads"
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            Open the pipeline
          </Link>
        </CardHeader>

        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <MetricTile
            label="Average cycle length"
            metric={kpi.lagging.sales_cycle_days}
            format={days}
            tone={3}
            hint={
              // Said out loud, because an average over two deals is not a
              // benchmark and a reader has no way to know how thin it is.
              kpi.context.cycles_measured === 0
                ? "No completed cycles yet"
                : `Averaged over ${kpi.context.cycles_measured} won ${
                    kpi.context.cycles_measured === 1 ? "deal" : "deals"
                  }`
            }
          />
          <MetricTile
            label="Deals lost"
            metric={{ value: kpi.context.deals_lost }}
            format={count}
            tone={2}
            hint="Decided against us in this window"
          />
        </div>
      </Card>
    </div>
  )
}

export default SalesDashboard
