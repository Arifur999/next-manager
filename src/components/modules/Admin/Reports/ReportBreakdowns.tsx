"use client"

import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { formatBdt, formatUsd } from "@/lib/currency"
import {
  getCashFlow,
  getClientRevenue,
  getExpenses,
} from "@/services/agencio.services"
import type { Currency, IExpense } from "@/types/agencio.types"
import { useQuery } from "@tanstack/react-query"

type ClientRevenueRow = {
  client: { id: string; name: string; company: string } | null
  revenue_usd: number
  revenue_bdt_reporting: number
  payment_count: number
}

type CashFlow = {
  by_source: Array<{ source: string; currency: Currency; amount: number }>
  totals: Record<Currency, { in: number; out: number; net: number }>
  transfer_sources: string[]
}

const SOURCE_LABEL: Record<string, string> = {
  opening_balance: "Opening balance",
  payment: "Client payments",
  expense: "Expenses",
  team_payout: "Team payouts",
  owner_withdrawal: "Owner withdrawals",
  exchange_out: "Exchanged out",
  exchange_in: "Exchanged in",
  due_received: "Due received",
  due_payment: "Due paid",
  adjustment: "Adjustments",
}

/**
 * A labelled bar whose width is a share of the largest row.
 *
 * Every row is direct-labelled with its figure, which is what the palette's
 * contrast relief requires — and with this few rows the labels do not become
 * the noise that labelling every point on a chart would.
 */
const ShareRow = ({
  label,
  sub,
  value,
  share,
  negative,
}: {
  label: string
  sub?: string
  value: string
  share: number
  negative?: boolean
}) => (
  <li className="px-5 py-3">
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-sm">{label}</p>
        {sub && <p className="truncate text-xs text-muted-foreground">{sub}</p>}
      </div>
      <span className="shrink-0 text-sm font-medium tabular-nums">{value}</span>
    </div>
    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
      <div
        // Money out is a different STATE, not a different series, so it takes
        // the destructive colour rather than a second categorical hue.
        className={`h-full rounded-full ${negative ? "bg-destructive/70" : "bg-chart-1"}`}
        style={{ width: `${Math.min(share, 100)}%` }}
      />
    </div>
  </li>
)

const ReportBreakdowns = () => {
  const { data: cashData } = useQuery({
    queryKey: ["report-cash-flow"],
    queryFn: () => getCashFlow(),
  })
  const { data: clientData } = useQuery({
    queryKey: ["report-client-revenue"],
    queryFn: () => getClientRevenue(),
  })
  // The category breakdown endpoint exists, but the expense list already
  // carries category on each row and this page loads it anyway — grouping here
  // saves a round-trip rather than duplicating a query.
  const { data: expenseData } = useQuery({
    queryKey: ["expenses", ""],
    queryFn: () => getExpenses(),
  })

  const cash = cashData?.data as CashFlow | undefined
  const clients = (clientData?.data ?? []) as ClientRevenueRow[]
  const expenses = (expenseData?.data ?? []) as IExpense[]

  const byCategory = Object.values(
    expenses.reduce<Record<string, { name: string; type: string; total: number; count: number }>>(
      (groups, expense) => {
        const key = expense.category?.id ?? "uncategorised"
        const existing = groups[key]
        groups[key] = {
          name: expense.category?.name ?? "Uncategorised",
          type: expense.category?.type ?? "general",
          total: (existing?.total ?? 0) + expense.amount_bdt,
          count: (existing?.count ?? 0) + 1,
        }
        return groups
      },
      {},
    ),
  ).sort((a, b) => b.total - a.total)

  const topCategory = byCategory[0]?.total ?? 1
  const topClient = clients[0]?.revenue_usd ?? 1

  // Exchanges move money between the agency's own wallets, so they are not
  // income or spending. They stay visible but labelled, rather than being
  // silently folded into either side.
  const isTransfer = (source: string) => cash?.transfer_sources.includes(source) ?? false
  const flows = (cash?.by_source ?? []).filter((flow) => flow.amount !== 0)
  const biggestFlow = Math.max(...flows.map((flow) => Math.abs(flow.amount)), 1)

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="gap-0 overflow-hidden p-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle className="text-base">Revenue by client</CardTitle>
          <p className="text-sm text-muted-foreground">Money received, highest first.</p>
        </CardHeader>

        {clients.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-muted-foreground">
            No payments recorded yet.
          </p>
        ) : (
          <ul className="divide-y">
            {clients.map((row) => (
              <ShareRow
                key={row.client?.id ?? "unknown"}
                label={row.client?.name ?? "Unknown client"}
                sub={`${row.payment_count} payment${row.payment_count === 1 ? "" : "s"} · ${formatBdt(row.revenue_bdt_reporting)} at recorded rates`}
                value={formatUsd(row.revenue_usd)}
                share={(row.revenue_usd / topClient) * 100}
              />
            ))}
          </ul>
        )}
      </Card>

      <Card className="gap-0 overflow-hidden p-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle className="text-base">Expense by category</CardTitle>
          <p className="text-sm text-muted-foreground">
            Employee-type categories are flagged — reports keep them apart from operating costs.
          </p>
        </CardHeader>

        {byCategory.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-muted-foreground">
            No expenses recorded yet.
          </p>
        ) : (
          <ul className="divide-y">
            {byCategory.map((group) => (
              <ShareRow
                key={group.name}
                label={group.name}
                sub={`${group.count} entr${group.count === 1 ? "y" : "ies"}${group.type === "employee" ? " · employee cost" : ""}`}
                value={formatBdt(group.total)}
                share={(group.total / topCategory) * 100}
              />
            ))}
          </ul>
        )}
      </Card>

      <Card className="gap-0 overflow-hidden p-0 lg:col-span-2">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle className="text-base">Cash flow</CardTitle>
          <p className="text-sm text-muted-foreground">
            Read straight off the ledger, so it cannot fall out of step with the modules. USD and
            BDT are kept apart — an exchange moves money between your own wallets and is marked as
            a transfer rather than counted as income or spending.
          </p>
        </CardHeader>

        {flows.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-muted-foreground">
            Nothing has moved yet.
          </p>
        ) : (
          <>
            <div className="grid gap-4 border-b px-5 py-4 sm:grid-cols-2">
              {(["USD", "BDT"] as const).map((currency) => {
                const totals = cash?.totals[currency]
                if (!totals) return null
                const format = currency === "USD" ? formatUsd : formatBdt

                return (
                  <div key={currency}>
                    <p className="text-xs text-muted-foreground">{currency}</p>
                    <p className="mt-1 text-lg font-semibold tabular-nums">{format(totals.net)}</p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {format(totals.in)} in · {format(totals.out)} out
                    </p>
                  </div>
                )
              })}
            </div>

            <ul className="divide-y">
              {flows.map((flow) => (
                <ShareRow
                  key={`${flow.source}-${flow.currency}`}
                  label={SOURCE_LABEL[flow.source] ?? flow.source}
                  sub={`${flow.currency}${isTransfer(flow.source) ? " · transfer, not income or spending" : ""}`}
                  value={
                    flow.currency === "USD"
                      ? formatUsd(Math.abs(flow.amount))
                      : formatBdt(Math.abs(flow.amount))
                  }
                  share={(Math.abs(flow.amount) / biggestFlow) * 100}
                  negative={flow.amount < 0}
                />
              ))}
            </ul>
          </>
        )}
      </Card>
    </div>
  )
}

export default ReportBreakdowns
