"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { getTransactions } from "@/services/agencio.services"
import type { ITransaction, LedgerSource } from "@/types/agencio.types"
import { useQuery } from "@tanstack/react-query"
import { format, parseISO } from "date-fns"
import { Scale } from "lucide-react"
import { useSearchParams } from "next/navigation"

/**
 * Every movement of money, in one list.
 *
 * Each of these rows was already being written by the thing that caused it — a
 * payment, an expense, an exchange. Until now nothing read them together, so
 * "what happened to our money in March" meant opening five screens and adding
 * up by hand.
 *
 * Read-only, and it stays that way. A ledger somebody can type into directly is
 * one that can be made to disagree with the records it summarises.
 */

const SOURCE_LABEL: Record<LedgerSource, string> = {
  opening_balance: "opening balance",
  payment: "client payment",
  expense: "expense",
  team_payout: "team payout",
  owner_withdrawal: "withdrawal",
  exchange_out: "exchange out",
  exchange_in: "exchange in",
  due_received: "money back",
  due_payment: "money lent",
  adjustment: "adjustment",
}

/**
 * What each row means to the business.
 *
 * Read from the source, never from the sign of the amount. The two halves of an
 * exchange look exactly like income and an expense — money arrives in one
 * account and leaves another — and treating them as either would inflate both
 * sides of the books with money that never entered or left the business.
 */
const KIND_OF: Partial<Record<LedgerSource, "income" | "expense" | "transfer">> = {
  payment: "income",
  due_received: "income",
  expense: "expense",
  team_payout: "expense",
  owner_withdrawal: "expense",
  due_payment: "expense",
  exchange_in: "transfer",
  exchange_out: "transfer",
}

const TONE = {
  income: "secondary",
  expense: "outline",
  transfer: "outline",
} as const

const HEADING: Record<string, { title: string; blurb: string }> = {
  income: {
    title: "Income",
    blurb: "Money that came in from outside — client payments, and loans coming back.",
  },
  expense: {
    title: "Expenses",
    blurb: "Money that left — costs, team payouts, withdrawals, and money lent out.",
  },
  transfer: {
    title: "Transfers",
    blurb:
      "Money moved between your own accounts. Neither income nor an expense, however much it looks like both.",
  },
}

const money = (amount: number, currency: string) =>
  `${amount < 0 ? "−" : ""}${currency === "USD" ? "$" : "৳"}${Math.abs(amount).toLocaleString(
    undefined,
    { minimumFractionDigits: 2, maximumFractionDigits: 2 }
  )}`

const TransactionsBoard = () => {
  const searchParams = useSearchParams()
  const kind = searchParams.get("kind") ?? ""

  const query = kind ? `kind=${kind}` : ""

  const { data, isLoading } = useQuery({
    queryKey: ["transactions", query],
    queryFn: () => getTransactions(query || undefined),
  })

  const rows = (data?.data ?? []) as ITransaction[]
  const totals = data?.meta?.totals ?? []

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <CardHeader className="space-y-2 border-b px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">
              {kind ? HEADING[kind]?.title : "Everything"}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {kind
                ? HEADING[kind]?.blurb
                : "Every movement, including the ones that are none of the three — an opening balance is where counting started, and an adjustment is a correction."}
            </p>
          </div>

          {/* Per currency, never added together. Dollars plus taka is a number
              that is true of nothing. */}
          {totals.length > 0 && (
            <div className="text-right">
              {totals.map((total) => (
                <p key={total.currency} className="text-sm tabular-nums">
                  <span className="text-muted-foreground">{total.currency} </span>
                  {money(total.amount, total.currency)}
                </p>
              ))}
            </div>
          )}
        </div>
      </CardHeader>

      {isLoading && rows.length === 0 ? (
        <div className="h-40 animate-pulse bg-muted/40" />
      ) : rows.length === 0 ? (
        <p className="flex flex-col items-center gap-2 px-6 py-12 text-center text-sm text-muted-foreground">
          <Scale className="size-7" aria-hidden="true" />
          {kind ? `Nothing under ${HEADING[kind]?.title.toLowerCase()} yet.` : "Nothing recorded yet."}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[48rem] text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="px-5 py-2.5 font-medium">Date</th>
                <th className="px-5 py-2.5 font-medium">What happened</th>
                <th className="px-5 py-2.5 font-medium">Account</th>
                <th className="px-5 py-2.5 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((row) => {
                const rowKind = KIND_OF[row.source_type]

                return (
                  <tr key={row.id}>
                    <td className="whitespace-nowrap px-5 py-3 text-muted-foreground">
                      {format(parseISO(row.date), "d MMM yyyy")}
                    </td>

                    <td className="px-5 py-3">
                      <p>{row.description || SOURCE_LABEL[row.source_type]}</p>
                      <p className="text-xs text-muted-foreground">
                        {SOURCE_LABEL[row.source_type]}
                        {rowKind ? "" : " · counted in neither direction"}
                      </p>
                    </td>

                    <td className="px-5 py-3">
                      {row.account.name}
                      <span className="ml-1.5 text-xs text-muted-foreground">
                        {row.account.currency}
                      </span>
                    </td>

                    <td className="px-5 py-3 text-right">
                      <span className="tabular-nums">{money(row.amount, row.currency)}</span>
                      {rowKind && (
                        <Badge variant={TONE[rowKind]} className="ml-2 text-[10px]">
                          {rowKind}
                        </Badge>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

export default TransactionsBoard
