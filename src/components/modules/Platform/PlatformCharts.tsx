"use client"

import ChartCard from "@/components/modules/Platform/ChartCard"
import ErrorState from "@/components/shared/state/ErrorState"
import { formatUsd } from "@/lib/currency"
import { useQuery } from "@tanstack/react-query"
import { format, parse, parseISO } from "date-fns"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { platformTrendQuery } from "@/queries/platform.queries"

/**
 * The platform's own numbers, drawn.
 *
 * Follows the rules MonthlyChart already established here: one y-axis per
 * chart, never two; at most two series; a table view for when colour cannot be
 * relied on; and recessive grid and axes so the data is the loudest thing.
 *
 * Colours come from the validated chart palette in globals.css rather than
 * from recharts' defaults — those defaults have not been checked for
 * colourblind separation or contrast against this surface.
 */

const compactUsd = (value: number) => formatUsd(value, { compact: true })

type TooltipProps = {
  active?: boolean
  payload?: Array<{ dataKey?: string | number; value?: number; name?: string }>
  label?: string
}

const ChartTooltip = ({
  active,
  payload,
  label,
  format: formatValue,
}: TooltipProps & { format: (value: number) => string }) => {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{label}</p>
      {payload.map((entry) => (
        <p key={String(entry.dataKey)} className="text-muted-foreground tabular-nums">
          {entry.name}: {formatValue(entry.value ?? 0)}
        </p>
      ))}
    </div>
  )
}

const PlatformCharts = () => {
  const { data, isLoading, isError, isFetching, refetch } = useQuery(platformTrendQuery())

  const trend = data?.data

  if (isLoading && !trend) {
    return <div className="h-64 animate-pulse rounded-xl bg-muted/40" />
  }

  if (isError || !trend) {
    return (
      <ErrorState
        className="rounded-xl border border-dashed"
        message="The charts did not load."
        onRetry={() => void refetch()}
        isRetrying={isFetching}
      />
    )
  }

  const signups = trend.signups.map((row) => ({
    ...row,
    label: format(parse(row.month, "yyyy-MM", new Date()), "MMM yy"),
  }))

  const mrr = trend.mrr.map((row) => ({
    ...row,
    label: format(parseISO(row.date), "d MMM"),
  }))

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <ChartCard
        title="Companies gained"
        note="Per month, from the day each one signed up."
        empty="Nobody has signed up yet."
        columns={["Month", "Companies"]}
        rows={signups.map((row) => ({ key: row.month, cells: [row.label, String(row.count)] }))}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={signups} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              className="fill-muted-foreground text-xs"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              className="fill-muted-foreground text-xs"
            />
            <Tooltip
              cursor={{ className: "fill-muted/40" }}
              content={<ChartTooltip format={(value) => String(value)} />}
            />
            {/* One series, so no legend: the title already names it. */}
            <Bar
              dataKey="count"
              name="Companies"
              fill="var(--chart-1)"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Revenue by plan"
        note="What each tier brings in today, across the companies paying for it."
        empty="Nobody is paying yet."
        columns={["Plan", "Companies", "Monthly"]}
        rows={trend.revenue_by_plan.map((row) => ({
          key: row.name,
          cells: [row.name, String(row.companies), formatUsd(row.mrr_usd)],
        }))}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={trend.revenue_by_plan}
            layout="vertical"
            margin={{ top: 4, right: 16, bottom: 0, left: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={compactUsd}
              tickLine={false}
              axisLine={false}
              className="fill-muted-foreground text-xs"
            />
            <YAxis
              type="category"
              dataKey="name"
              width={80}
              tickLine={false}
              axisLine={false}
              className="fill-muted-foreground text-xs"
            />
            <Tooltip cursor={{ className: "fill-muted/40" }} content={<ChartTooltip format={formatUsd} />} />
            <Bar dataKey="mrr_usd" name="Monthly" fill="var(--chart-3)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="xl:col-span-2">
        <ChartCard
          title="Monthly revenue over time"
          note={
            // The honest version. This chart cannot be backfilled, and saying
            // why beats letting somebody think it is broken.
            trend.snapshots_since
              ? `Recorded nightly since ${format(parseISO(trend.snapshots_since), "d MMM yyyy")}.`
              : "Recorded nightly from today onward."
          }
          empty="This one builds up from today. It cannot be filled in backwards — subscriptions keep no history, so a line drawn from sign-up dates could never show anybody leaving."
          columns={["Date", "Monthly revenue", "Paying"]}
          rows={mrr.map((row) => ({
            key: row.date,
            cells: [row.label, formatUsd(row.mrr_usd), String(row.companies_active)],
          }))}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mrr} margin={{ top: 4, right: 8, bottom: 0, left: -8 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                className="fill-muted-foreground text-xs"
              />
              {/* One axis. Paying-company count is deliberately not a second
                  series here - two scales on one chart is the mistake that
                  makes every comparison on it meaningless. It is in the table
                  view instead. */}
              <YAxis
                tickFormatter={compactUsd}
                tickLine={false}
                axisLine={false}
                className="fill-muted-foreground text-xs"
              />
              <Tooltip content={<ChartTooltip format={formatUsd} />} />
              <Line
                type="monotone"
                dataKey="mrr_usd"
                name="Monthly revenue"
                stroke="var(--chart-1)"
                strokeWidth={2}
                dot={mrr.length <= 30 ? { r: 3 } : false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}

export default PlatformCharts
