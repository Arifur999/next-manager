"use client"

import { deleteDueTransactionAction } from "@/app/(dashboardLayout)/admin/dashboard/due-payments/_action"
import DeleteMoneyRecordDialog from "@/components/modules/Admin/Money/DeleteMoneyRecordDialog"
import { dueTransactionReversal } from "@/components/modules/Admin/Money/reversalCopy"
import EmptyState from "@/components/shared/state/EmptyState"
import PanelState from "@/components/shared/state/PanelState"
import DataTableRowActions from "@/components/shared/table/DataTableRowActions"
import { useRowActionModalState } from "@/hooks/useRowActionModalState"
import { formatBdt } from "@/lib/currency"
import { formatDay } from "@/lib/dates"
import { queryKeys } from "@/lib/queryKeys"
import type { IDueTransaction } from "@/types/spending.types"
import type { UseQueryResult } from "@tanstack/react-query"
import { ArrowLeftRight } from "lucide-react"

type DueTransactionsListProps = {
  query: UseQueryResult<unknown>
  transactions: IDueTransaction[]
}

// The latest money lent and borrowed. A transaction moved real money, so it is
// corrected by deleting it (the API reverses it) and recording it again.
const DueTransactionsList = ({ query, transactions }: DueTransactionsListProps) => {
  const { deletingItem, isDeleteDialogOpen, onDeleteOpenChange, tableActions } =
    useRowActionModalState<IDueTransaction>({ enableView: false, enableEdit: false })

  return (
    <>
      <PanelState
        query={query}
        errorMessage="Transactions did not load."
        isEmpty={transactions.length === 0}
        empty={
          <EmptyState icon={ArrowLeftRight} hint="Money lent or borrowed shows here once it is recorded.">
            Nothing recorded yet.
          </EmptyState>
        }
      >
        <ul className="divide-y">
          {transactions.slice(0, 12).map((transaction) => (
            <li key={transaction.id} className="flex items-center justify-between gap-3 py-3 pr-3 pl-5">
              <div className="min-w-0">
                <p className="truncate text-sm">{transaction.due_person?.name ?? "N/A"}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDay(transaction.date)}
                  {transaction.account ? ` · ${transaction.account.name}` : ""}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`text-sm font-medium tabular-nums ${
                    transaction.direction === "received" ? "text-chart-3" : "text-chart-2"
                  }`}
                >
                  {transaction.direction === "received" ? "+" : "−"}
                  {formatBdt(transaction.amount_bdt)}
                </span>
                <DataTableRowActions row={transaction} actions={tableActions} />
              </div>
            </li>
          ))}
        </ul>
      </PanelState>

      <DeleteMoneyRecordDialog
        open={isDeleteDialogOpen}
        onOpenChange={onDeleteOpenChange}
        recordId={deletingItem?.id}
        title="Delete this transaction?"
        description={deletingItem ? dueTransactionReversal(deletingItem) : ""}
        action={deleteDueTransactionAction}
        successMessage="Transaction deleted"
        invalidateKeys={[queryKeys.dueTransactions.all, queryKeys.duePeople.all]}
      />
    </>
  )
}

export default DueTransactionsList
