"use client"

import MonthlyChart from "@/components/modules/Admin/Reports/MonthlyChart"
import StatTile from "@/components/shared/StatTile"
import { formatBdt, formatPercent, formatUsd } from "@/lib/currency"
import { getMonthlySeries, getProfitAndLoss } from "@/services/agencio.services"
import type { IMonthlyPoint, IProfitAndLoss } from "@/types/agencio.types"
import { useQuery } from "@tanstack/react-query"
import { ArrowDownLeft, Receipt, TrendingUp, Wallet } from "lucide-react"

/**
 * How the business is doing, in four numbers and one chart.
 *
 * The headline only. Who pays, which projects earned, what each team costs and
 * where the money went each have their own page — one screen carrying all five
 * answers is one nobody reads to the bottom of.
 */
const BusinessReport = () => {
  const { data: plData } = useQuery({
    queryKey: ["report-pl"],
    queryFn: () => getProfitAndLoss(),
  })
  const { data: monthlyData } = useQuery({
    queryKey: ["report-monthly"],
    queryFn: () => getMonthlySeries(12),
  })

  const pl = plData?.data as IProfitAndLoss | undefined
  const monthly = (monthlyData?.data ?? []) as IMonthlyPoint[]

  return (
    <div className="space-y-6">
      {pl && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile
            label="Revenue"
            value={formatUsd(pl.revenue.usd)}
            secondary={`${formatBdt(pl.revenue.bdt_reporting)} at recorded rates`}
            hint={`${pl.revenue.payment_count} payment${pl.revenue.payment_count === 1 ? "" : "s"}`}
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
      )}

      <MonthlyChart data={monthly} />
    </div>
  )
}

export default BusinessReport
