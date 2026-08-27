"use client"

import MonthlyChart from "@/components/modules/Admin/Reports/MonthlyChart"
import ReportBreakdowns from "@/components/modules/Admin/Reports/ReportBreakdowns"
import StatTile from "@/components/shared/StatTile"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { formatBdt, formatPercent, formatUsd } from "@/lib/currency"
import {
  getMonthlySeries,
  getProfitAndLoss,
  getProjectProfitability,
} from "@/services/agencio.services"
import type { IMonthlyPoint, IProfitAndLoss } from "@/types/agencio.types"
import { useQuery } from "@tanstack/react-query"
import { ArrowDownLeft, Receipt, TrendingUp, Wallet } from "lucide-react"

type ProjectRow = {
  project: { id: string; name: string; code: string }
  received_bdt_reporting: number
  total_cost_bdt: number
  profit_bdt: number
  margin_pct: number
}

const ReportsBoard = () => {
  const { data: plData } = useQuery({
    queryKey: ["report-pl"],
    queryFn: () => getProfitAndLoss(),
  })
  const { data: monthlyData } = useQuery({
    queryKey: ["report-monthly"],
    queryFn: () => getMonthlySeries(12),
  })
  const { data: projectsData } = useQuery({
    queryKey: ["report-project-profitability"],
    queryFn: () => getProjectProfitability(),
  })

  const pl = plData?.data as IProfitAndLoss | undefined
  const monthly = (monthlyData?.data ?? []) as IMonthlyPoint[]
  const projects = (projectsData?.data ?? []) as ProjectRow[]

  // Nominal categories — project names have no inherent order — so every bar
  // takes the SAME slot-1 hue. Colouring them by value would spend the identity
  // channel re-encoding what the bar length already shows.
  const widest = Math.max(...projects.map((row) => Math.abs(row.profit_bdt)), 1)

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

      <ReportBreakdowns />

      <Card className="gap-0 overflow-hidden p-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle className="text-base">Project profitability</CardTitle>
          <p className="text-sm text-muted-foreground">
            Money received minus money spent, per project. Unpaid work is not profit.
          </p>
        </CardHeader>

        {projects.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-muted-foreground">
            No projects with recorded money yet.
          </p>
        ) : (
          <ul className="divide-y">
            {projects.map((row) => {
              const width = (Math.abs(row.profit_bdt) / widest) * 100
              const isLoss = row.profit_bdt < 0

              return (
                <li key={row.project.id} className="px-5 py-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{row.project.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {formatBdt(row.received_bdt_reporting)} in ·{" "}
                        {formatBdt(row.total_cost_bdt)} out
                      </p>
                    </div>

                    {/* Direct label on every row, which is what the contrast
                        relief requires — and there are few enough rows that it
                        does not become noise. */}
                    <span className="shrink-0 text-sm font-medium tabular-nums">
                      {formatBdt(row.profit_bdt)}
                    </span>
                  </div>

                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      // A loss is a different STATE, not a different series, so
                      // it takes the destructive status colour rather than
                      // another categorical hue.
                      className={`h-full rounded-full ${isLoss ? "bg-destructive" : "bg-chart-1"}`}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </div>
  )
}

export default ReportsBoard
