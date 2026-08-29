"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { usd } from "@/components/shared/kpi/MetricTile"
import type { SalesKpi } from "@/types/kpi.types"
import { Store } from "lucide-react"

/**
 * Which marketplace is actually paying.
 *
 * Sorted by money won, not by deal count, because the reader is deciding where
 * to spend the next hour and ten small jobs from one platform can be worth
 * less than two from another.
 *
 * Counted over the whole history rather than the selected window. A
 * marketplace's win rate across one month is three deals, and a number that
 * swings between 0% and 100% as the date range moves is one nobody can act on.
 * The heading says so, so the figures are not read as belonging to the range
 * picker above them.
 */

const WhereWorkComesFrom = ({ rows }: { rows: SalesKpi["by_source"] }) => {
  const totalWonValue = rows.reduce((running, row) => running + row.won_value_usd, 0)
  const untagged = rows.find((row) => row.name === "Not recorded")

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <CardHeader className="border-b px-5 py-4">
        <CardTitle className="text-base">Where the work comes from</CardTitle>
        <p className="text-sm text-muted-foreground">
          Across every deal, not the range above — a marketplace&apos;s win rate over one
          month is three deals.
          {untagged && untagged.won + untagged.lost + untagged.open > 0 && (
            <>
              {" "}
              {/* Named rather than quietly excluded: a reader comparing
                  platforms should know how much of the picture is missing. */}
              {untagged.won + untagged.lost + untagged.open} leads have no source
              recorded.
            </>
          )}
        </p>
      </CardHeader>

      {rows.length === 0 ? (
        <p className="flex flex-col items-center gap-2 px-6 py-10 text-center text-sm text-muted-foreground">
          <Store className="size-7" aria-hidden="true" />
          No leads yet. Tag them with a marketplace and this answers which one pays.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="px-5 py-2.5 font-medium">Source</th>
                <th className="px-5 py-2.5 text-right font-medium">Won</th>
                <th className="px-5 py-2.5 text-right font-medium">Lost</th>
                <th className="px-5 py-2.5 text-right font-medium">Open</th>
                <th className="px-5 py-2.5 text-right font-medium">Win rate</th>
                <th className="px-5 py-2.5 text-right font-medium">Value won</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((row) => (
                <tr key={row.name}>
                  <td className="px-5 py-3">
                    <span className="font-medium">{row.name}</span>
                    {totalWonValue > 0 && row.won_value_usd > 0 && (
                      <span className="ml-2 text-xs text-muted-foreground tabular-nums">
                        {Math.round((row.won_value_usd / totalWonValue) * 100)}% of value
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums">{row.won}</td>
                  <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
                    {row.lost}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
                    {row.open}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {row.win_rate_pct === null ? (
                      // Nothing decided here yet. Showing 0% would read as
                      // "we tried and failed", which is a different claim.
                      <span className="text-xs text-muted-foreground">not decided yet</span>
                    ) : (
                      <Badge variant={row.win_rate_pct >= 30 ? "secondary" : "outline"}>
                        {row.win_rate_pct.toFixed(0)}%
                      </Badge>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right font-medium tabular-nums">
                    {usd(row.won_value_usd)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

export default WhereWorkComesFrom
