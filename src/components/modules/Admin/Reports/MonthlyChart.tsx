"use client"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { formatBdt } from "@/lib/currency"
import type { IMonthlyPoint } from "@/types/agencio.types"
import { format, parse } from "date-fns"
import { Table2, TrendingUp } from "lucide-react"
import { useState } from "react"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

/**
 * Revenue against cost, month by month.
 *
 * Two series, not three: profit is the GAP between these lines, and drawing it
 * as a third would re-encode what the reader can already see while adding a
 * hue that has to be told apart from the other two.
 *
 * Both series are BDT, so they share one axis. There is deliberately no second
 * y-scale for the USD figure — two scales on one chart is the mistake that
 * makes every comparison on it meaningless.
 */

const monthLabel = (month: string) => format(parse(month, "yyyy-MM", new Date()), "MMM")

const compact = (value: number) =>
  new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value)

type TooltipPayload = {
  active?: boolean
  payload?: Array<{ dataKey?: string | number; value?: number; color?: string }>
  label?: string
}

const ChartTooltip = ({ active, payload, label }: TooltipPayload) => {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="mb-1 font-medium">
        {label ? format(parse(label, "yyyy-MM", new Date()), "MMMM yyyy") : ""}
      </p>
      {payload.map((entry) => (
        <p key={String(entry.dataKey)} className="flex items-center gap-2 text-muted-foreground">
          {/* The swatch carries identity; the text stays in ink tokens rather
              than wearing the series colour. */}
          <span
            className="size-2 shrink-0 rounded-full"
            style={{ backgroundColor: entry.color }}
            aria-hidden="true"
          />
          {entry.dataKey === "revenue_bdt_reporting" ? "Revenue" : "Cost"}
          <span className="ml-auto font-medium text-foreground tabular-nums">
            {formatBdt(entry.value ?? 0)}
          </span>
        </p>
      ))}
    </div>
  )
}

const MonthlyChart = ({ data }: { data: IMonthlyPoint[] }) => {
  const [showTable, setShowTable] = useState(false)

  const hasAnything = data.some((point) => point.revenue_bdt_reporting > 0 || point.cost_bdt > 0)

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
        <div>
          <CardTitle className="text-base">Revenue against cost</CardTitle>
          <p className="text-sm text-muted-foreground">
            Both in BDT. Revenue uses each payment&apos;s recorded rate, so past months do not move.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Legend — always present for two series, so identity is never
              carried by colour alone. */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-chart-1" aria-hidden="true" />
              Revenue
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-chart-2" aria-hidden="true" />
              Cost
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowTable((previous) => !previous)}
          >
            {showTable ? <TrendingUp className="size-3.5" /> : <Table2 className="size-3.5" />}
            {showTable ? "Chart" : "Table"}
          </Button>
        </div>
      </CardHeader>

      {!hasAnything ? (
        <p className="px-5 py-16 text-center text-sm text-muted-foreground">
          Nothing recorded in this period yet.
        </p>
      ) : showTable ? (
        // The table view is not a nicety: one series sits just under 3:1 on
        // white, and the validator's contrast relief is exactly this.
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-5 py-2 font-medium">Month</th>
                <th className="px-5 py-2 text-right font-medium">Revenue</th>
                <th className="px-5 py-2 text-right font-medium">Cost</th>
                <th className="px-5 py-2 text-right font-medium">Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.map((point) => (
                <tr key={point.month}>
                  <td className="px-5 py-2">
                    {format(parse(point.month, "yyyy-MM", new Date()), "MMM yyyy")}
                  </td>
                  <td className="px-5 py-2 text-right tabular-nums">
                    {formatBdt(point.revenue_bdt_reporting)}
                  </td>
                  <td className="px-5 py-2 text-right tabular-nums">{formatBdt(point.cost_bdt)}</td>
                  <td className="px-5 py-2 text-right font-medium tabular-nums">
                    {formatBdt(point.profit_bdt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-2 py-5">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data} margin={{ top: 8, right: 56, bottom: 4, left: 8 }}>
              {/* Hairline, solid, one step off surface — recessive by design. */}
              <CartesianGrid stroke="var(--border)" strokeWidth={1} vertical={false} />
              <XAxis
                dataKey="month"
                tickFormatter={monthLabel}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
              <YAxis
                tickFormatter={compact}
                tickLine={false}
                axisLine={false}
                width={48}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--border)" }} />

              <Line
                type="monotone"
                dataKey="revenue_bdt_reporting"
                stroke="var(--chart-1)"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                // >= 8px marker with a 2px surface ring, so it stays legible
                // where the two lines cross.
                dot={{ r: 4, fill: "var(--chart-1)", stroke: "var(--card)", strokeWidth: 2 }}
                activeDot={{ r: 5, fill: "var(--chart-1)", stroke: "var(--card)", strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="cost_bdt"
                stroke="var(--chart-2)"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                dot={{ r: 4, fill: "var(--chart-2)", stroke: "var(--card)", strokeWidth: 2 }}
                activeDot={{ r: 5, fill: "var(--chart-2)", stroke: "var(--card)", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  )
}

export default MonthlyChart
