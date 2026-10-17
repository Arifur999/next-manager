"use client"

import PlatformExpenses from "@/components/modules/Platform/PlatformExpenses"
import MetricTile, { count, pct, usd } from "@/components/shared/kpi/MetricTile"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { endOfMonth, format, startOfMonth } from "date-fns"
import { useState } from "react"
import { platformFinanceQuery } from "@/queries/platform.queries"

/**
 * AGENCIO's own money: what comes in from subscriptions, what goes out to run
 * it, and what is left.
 *
 * No customer's books are on this screen and none can be — the API does not
 * return those columns, and the smoke suite greps the response to prove it.
 *
 * The window defaults to this month, so "net" compares a monthly recurring
 * figure against a month of costs rather than against everything ever spent.
 */

const iso = (date: Date) => format(date, "yyyy-MM-dd")

const PlatformFinance = () => {
  const today = new Date()

  const [from, setFrom] = useState(iso(startOfMonth(today)))
  const [to, setTo] = useState(iso(endOfMonth(today)))

  const range = `from=${from}&to=${to}`

  // The last window stays on screen while a new one loads. Without it the page
  // fell back to its skeleton, unmounting the date input being typed into.
  const { data: financeData, isLoading } = useQuery({
    ...platformFinanceQuery(range),
    placeholderData: keepPreviousData,
  })

  const finance = financeData?.data

  if (isLoading && !finance) {
    return <div className="h-64 animate-pulse rounded-xl bg-muted/40" />
  }

  if (!finance) return null

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="finance-from">From</Label>
          <Input
            id="finance-from"
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="finance-to">To</Label>
          <Input
            id="finance-to"
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
          />
        </div>
        <p className="pb-2 text-xs text-muted-foreground">
          {/* Which figures move with the dates and which do not, said plainly. */}
          Costs and churn use this window. Revenue is what is recurring right now.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <MetricTile
          label="Net"
          metric={{ value: finance.net_usd }}
          format={usd}
          size="lead"
          tone={finance.net_usd >= 0 ? 3 : 2}
          hint={`${usd(finance.mrr_usd)} recurring, less ${usd(finance.expenses_usd)} spent in this window`}
        />
        <MetricTile
          label="Monthly revenue"
          metric={{ value: finance.mrr_usd }}
          format={usd}
          tone={1}
          hint={`${usd(finance.arr_usd)} a year at today's rate · counts past due, since it is owed`}
        />
        <MetricTile
          label="Per customer"
          metric={{
            value: finance.arpa_usd,
            // Null is a real answer here and the tile says why rather than
            // showing a zero somebody would read as "we earn nothing".
            reason: "Nobody is paying yet, so there is nothing to divide",
          }}
          format={usd}
          tone={3}
          hint={`Across ${finance.paying_companies} paying of ${finance.total_companies} companies`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          label="Spent in window"
          metric={{ value: finance.expenses_usd }}
          format={usd}
          tone={2}
          hint={`${finance.expense_count} ${finance.expense_count === 1 ? "entry" : "entries"}`}
        />
        <MetricTile
          label="Churn"
          metric={{
            value: finance.churn_rate_pct,
            reason: "Nobody has paid or left yet",
          }}
          format={pct}
          tone={2}
          hint={`${finance.churned_in_window} left in this window`}
        />
        <MetricTile
          label="On trial"
          metric={{ value: finance.by_status.trialing }}
          format={count}
          tone={1}
          hint="Worth nothing yet, by definition"
        />
        <MetricTile
          label="Past due"
          metric={{ value: finance.by_status.past_due }}
          format={count}
          tone={2}
          hint="Counted in revenue — the money is still owed"
        />
      </div>

      <PlatformExpenses range={range} />
    </div>
  )
}

export default PlatformFinance
