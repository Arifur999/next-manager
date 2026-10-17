"use client"

import FinanceFigures from "@/components/modules/Platform/FinanceFigures"
import PlatformExpenses from "@/components/modules/Platform/PlatformExpenses"
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

      <FinanceFigures finance={finance} />

      <PlatformExpenses range={range} />
    </div>
  )
}

export default PlatformFinance
