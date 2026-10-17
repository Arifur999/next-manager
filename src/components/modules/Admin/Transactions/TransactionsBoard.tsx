"use client"

import DataTable from "@/components/shared/table/DataTable"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { useServerDataTable } from "@/hooks/useServerDataTable"
import { formatMoney } from "@/lib/currency"
import { pickAllowed } from "@/lib/queryString"
import { toTableQueryProps } from "@/lib/table/queryProps"
import { transactionsListQuery } from "@/queries/finance.queries"
import { TRANSACTION_KINDS, type ITransaction, type TransactionKind } from "@/types/finance.types"
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"
import { transactionsColumns } from "./transactionsColumns"
import { TRANSACTIONS_TABLE } from "./transactionsTable.config"

const HEADING: Record<TransactionKind, { title: string; blurb: string }> = {
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
    blurb: "Money moved between your own accounts. Neither income nor an expense, however much it looks like both.",
  },
}

// Every movement of money in one read-only list: a ledger somebody could type
// into could be made to disagree with the records it summarises.
const TransactionsBoard = () => {
  const kind = pickAllowed(useSearchParams().get("kind"), TRANSACTION_KINDS)
  const queryClient = useQueryClient()
  const { queryString, filterQueryString, dataTableProps } = useServerDataTable<ITransaction>(TRANSACTIONS_TABLE)
  const transactionsQuery = useQuery({ ...transactionsListQuery(queryString), placeholderData: keepPreviousData })

  const transactions = transactionsQuery.data?.data ?? []
  const totals = transactionsQuery.data?.meta?.totals ?? []

  return (
    <Card className="gap-0 p-0">
      <CardHeader className="space-y-2 border-b px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">{kind ? HEADING[kind].title : "Everything"}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {kind
                ? HEADING[kind].blurb
                : "Every movement, including the ones that are none of the three — an opening balance is where counting started, and an adjustment is a correction."}
            </p>
          </div>

          {/* Per currency across every matching row, never added together:
              dollars plus taka is a number that is true of nothing. */}
          {totals.length > 0 && (
            <div className="text-right">
              {totals.map((total) => (
                <p key={total.currency} className="text-sm tabular-nums">
                  {formatMoney(total.amount, total.currency)}
                </p>
              ))}
            </div>
          )}
        </div>
      </CardHeader>

      <div className="p-4">
        <DataTable
          data={transactions}
          columns={transactionsColumns}
          tableId="transactions"
          exportFileName="transactions"
          exportRows={async () => (await queryClient.fetchQuery(transactionsListQuery(filterQueryString))).data}
          {...dataTableProps}
          {...toTableQueryProps(transactionsQuery)}
          // Shown only when nothing narrows the ledger; a filtered view says so itself.
          emptyMessage="Nothing recorded yet."
        />
      </div>
    </Card>
  )
}

export default TransactionsBoard
