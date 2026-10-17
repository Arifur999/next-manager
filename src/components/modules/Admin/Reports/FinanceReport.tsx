"use client"

import ShareRow from "@/components/modules/Admin/Reports/ShareRow"
import ReportEmpty from "@/components/modules/Admin/Reports/ReportEmpty"
import PanelState from "@/components/shared/state/PanelState"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { formatBdt, formatMoney } from "@/lib/currency"
import { plural } from "@/lib/text"
import { cn } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { expensesListQuery } from "@/queries/spending.queries"
import { cashFlowQuery } from "@/queries/insights.queries"

/**
 * Where the money went.
 *
 * Cash flow read straight off the ledger, so it cannot fall out of step with
 * the modules that write it, and spending grouped by what it was for.
 */

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

// `period` is the page's from/to; both cards cover the same days.
const FinanceReport = ({ period }: { period: string }) => {
  const cashQuery = useQuery(cashFlowQuery(period))

  // The category breakdown endpoint exists, but the expense list already
  // carries category on each row and this page loads it anyway — grouping here
  // saves a round-trip rather than duplicating a query.
  const expensesQuery = useQuery(expensesListQuery(period))

  const cash = cashQuery.data?.data
  const expenses = expensesQuery.data?.data ?? []

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
      {}
    )
  ).sort((a, b) => b.total - a.total)

  const topCategory = byCategory[0]?.total ?? 1

  // An exchange moves money between the agency's own wallets, so it is neither
  // income nor spending. It stays visible but labelled, rather than being
  // silently folded into either side.
  const isTransfer = (source: string) => cash?.transfer_sources.includes(source) ?? false
  const flows = (cash?.by_source ?? []).filter((flow) => flow.amount !== 0)
  const biggest = Math.max(...flows.map((flow) => Math.abs(flow.amount)), 1)

  return (
    <div className="space-y-4">
      <Card className="gap-0 overflow-hidden p-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle className="text-base">Cash flow</CardTitle>
          <p className="text-sm text-muted-foreground">
            Read straight off the ledger, so it cannot fall out of step with the modules
            that write it. USD and BDT are kept apart. Row by row, this is the same data as{" "}
            <Link
              href="/admin/dashboard/transactions"
              className="text-primary underline-offset-4 hover:underline"
            >
              Transactions
            </Link>
            .
          </p>
        </CardHeader>

        <PanelState
          query={cashQuery}
          errorMessage="Cash flow did not load."
          isEmpty={flows.length === 0}
          empty={<ReportEmpty>Nothing has moved yet.</ReportEmpty>}
        >
          <div className="grid gap-4 border-b px-5 py-4 sm:grid-cols-2">
            {(["USD", "BDT"] as const).map((currency) => {
              const totals = cash?.totals[currency]
              if (!totals) return null

              return (
                <div key={currency}>
                  <p className="text-xs text-muted-foreground">{currency}</p>
                  {/* The one figure where colour is the message: did more come in than went out. */}
                  <p
                    className={cn(
                      "mt-1 text-lg font-semibold tabular-nums",
                      totals.net >= 0 ? "text-success" : "text-destructive",
                    )}
                  >
                    {formatMoney(totals.net, currency)}
                  </p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {formatMoney(totals.in, currency)} in · {formatMoney(totals.out, currency)} out
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
                value={formatMoney(Math.abs(flow.amount), flow.currency)}
                share={(Math.abs(flow.amount) / biggest) * 100}
                negative={flow.amount < 0}
              />
            ))}
          </ul>
        </PanelState>
      </Card>

      <Card className="gap-0 overflow-hidden p-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle className="text-base">Expense by category</CardTitle>
          <p className="text-sm text-muted-foreground">
            Employee-type categories are flagged — reports keep them apart from operating
            costs, so the same salary is not counted twice.
          </p>
        </CardHeader>

        <PanelState
          query={expensesQuery}
          errorMessage="Expenses by category did not load."
          isEmpty={byCategory.length === 0}
          empty={<ReportEmpty>No expenses recorded yet.</ReportEmpty>}
        >
          <ul className="divide-y">
            {byCategory.map((group) => (
              <ShareRow
                key={group.name}
                label={group.name}
                sub={`${plural(group.count, "entry", "entries")}${group.type === "employee" ? " · employee cost" : ""}`}
                value={formatBdt(group.total)}
                share={(group.total / topCategory) * 100}
              />
            ))}
          </ul>
        </PanelState>
      </Card>
    </div>
  )
}

export default FinanceReport
