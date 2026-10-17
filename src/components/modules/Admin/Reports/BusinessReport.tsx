"use client"

import MonthlyChart from "@/components/modules/Admin/Reports/MonthlyChart"
import StatTile from "@/components/shared/StatTile"
import ErrorState from "@/components/shared/state/ErrorState"
import LoadingBlock from "@/components/shared/state/LoadingBlock"
import { Card } from "@/components/ui/card"
import { formatBdt, formatPercent, formatUsd } from "@/lib/currency"
import { plural } from "@/lib/text"
import { useQuery } from "@tanstack/react-query"
import { ArrowDownLeft, Receipt, TrendingUp, Wallet } from "lucide-react"
import { monthlySeriesQuery, profitAndLossListQuery } from "@/queries/insights.queries"

/**
 * How the business is doing, in four numbers and one chart.
 *
 * The headline only. Who pays, which projects earned, what each team costs and
 * where the money went each have their own page — one screen carrying all five
 * answers is one nobody reads to the bottom of.
 *
 * `period` is the page's from/to; the monthly chart always shows twelve months.
 */
const BusinessReport = ({ period }: { period: string }) => {
  const plQuery = useQuery(profitAndLossListQuery(period))
  const monthlyQuery = useQuery(monthlySeriesQuery(12))
  const pl = plQuery.data?.data

  const renderTiles = () => {
    if (plQuery.isError) {
      return (
        <Card>
          <ErrorState
            message="Profit and loss did not load."
            onRetry={() => void plQuery.refetch()}
            isRetrying={plQuery.isFetching}
          />
        </Card>
      )
    }
    if (!pl) return <LoadingBlock height="h-32" rounded />

    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Revenue"
          value={formatUsd(pl.revenue.usd)}
          secondary={`${formatBdt(pl.revenue.bdt_reporting)} at recorded rates`}
          hint={plural(pl.revenue.payment_count, "payment")}
          icon={<ArrowDownLeft className="size-5" />}
          tone={1}
        />
        <StatTile
          label="Operating cost"
          value={formatBdt(pl.cost.operating_expense_bdt)}
          hint="Excludes employee-type categories"
          icon={<Receipt className="size-5" />}
          tone={4}
        />
        <StatTile
          label="People cost"
          value={formatBdt(pl.cost.team_payout_bdt + pl.cost.employee_expense_bdt)}
          secondary={`${formatBdt(pl.cost.team_payout_bdt)} payouts · ${formatBdt(pl.cost.employee_expense_bdt)} salary expenses`}
          icon={<Wallet className="size-5" />}
          tone={5}
        />
        <StatTile
          label="Net profit"
          value={formatBdt(pl.net_profit_bdt)}
          // Owner withdrawals are deliberately not a cost here: that is
          // profit already earned, leaving.
          hint={`${formatPercent(pl.margin_pct)} margin · withdrawals are not counted as cost`}
          icon={<TrendingUp className="size-5" />}
          tone={3}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {renderTiles()}
      <MonthlyChart query={monthlyQuery} />
    </div>
  )
}

export default BusinessReport
