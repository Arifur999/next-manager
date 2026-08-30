"use client"

import ShareRow from "@/components/modules/Admin/Reports/ShareRow"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { formatBdt, formatUsd } from "@/lib/currency"
import { getCashFlow, getExpenses } from "@/services/agencio.services"
import type { Currency, IExpense } from "@/types/agencio.types"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"

/**
 * Where the money went.
 *
 * Cash flow read straight off the ledger, so it cannot fall out of step with
 * the modules that write it, and spending grouped by what it was for.
 */

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

const FinanceReport = () => {
  const { data: cashData } = useQuery({
    queryKey: ["report-cash-flow"],
    queryFn: () => getCashFlow(),
  })

  // The category breakdown endpoint exists, but the expense list already
  // carries category on each row and this page loads it anyway — grouping here
  // saves a round-trip rather than duplicating a query.
  const { data: expenseData } = useQuery({
    queryKey: ["expenses", ""],
    queryFn: () => getExpenses(),
  })

  const cash = cashData?.data as CashFlow | undefined
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
                  share={(Math.abs(flow.amount) / biggest) * 100}
                  negative={flow.amount < 0}
                />
              ))}
            </ul>
          </>
        )}
      </Card>

      <Card className="gap-0 overflow-hidden p-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle className="text-base">Expense by category</CardTitle>
          <p className="text-sm text-muted-foreground">
            Employee-type categories are flagged — reports keep them apart from operating
            costs, so the same salary is not counted twice.
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
    </div>
  )
}

export default FinanceReport
