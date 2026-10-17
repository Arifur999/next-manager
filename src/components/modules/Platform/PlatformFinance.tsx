"use client"

import FinanceFigures from "@/components/modules/Platform/FinanceFigures"
import PlatformExpenses from "@/components/modules/Platform/PlatformExpenses"
import ErrorState from "@/components/shared/state/ErrorState"
import LoadingBlock from "@/components/shared/state/LoadingBlock"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { endOfMonth, format, startOfMonth } from "date-fns"
import { useState } from "react"
import { platformFinanceQuery } from "@/queries/platform.queries"

/**
 * The platform's own money: subscription revenue in, running costs out. No
 * customer's books are here; the API does not return them. The window
 * defaults to this month, so costs are set against one month of revenue.
 */

const iso = (date: Date) => format(date, "yyyy-MM-dd")

const PlatformFinance = () => {
  const today = new Date()

  const [from, setFrom] = useState(iso(startOfMonth(today)))
  const [to, setTo] = useState(iso(endOfMonth(today)))

  const range = `from=${from}&to=${to}`

  // The last window's figures stay up while a new window loads, instead of a skeleton.
  const financeQuery = useQuery({
    ...platformFinanceQuery(range),
    placeholderData: keepPreviousData,
  })

  const finance = financeQuery.data?.data

  // Only the figures wait or fail: the window picker stays, so a window that
  // cannot be loaded can still be changed.
  const renderFigures = () => {
    if (financeQuery.isLoading) return <LoadingBlock height="h-64" rounded />

    if (financeQuery.isError || !finance) {
      return (
        <ErrorState
          className="rounded-xl border border-dashed"
          message="The financial report did not load."
          onRetry={() => void financeQuery.refetch()}
          isRetrying={financeQuery.isFetching}
        />
      )
    }

    return <FinanceFigures finance={finance} />
  }

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
          Costs and churn use these dates. Revenue is what recurs today.
        </p>
      </div>

      {renderFigures()}

      <PlatformExpenses range={range} />
    </div>
  )
}

export default PlatformFinance
