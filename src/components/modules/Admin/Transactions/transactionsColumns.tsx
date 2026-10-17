import DataTableColumnHeader from "@/components/shared/table/DataTableColumnHeader"
import { formatMoney } from "@/lib/currency"
import { formatDay } from "@/lib/dates"
import type { ITransaction, LedgerSource, TransactionKind } from "@/types/finance.types"
import type { ColumnDef } from "@tanstack/react-table"

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

// What a row means to the business, read from its source and never from the
// sign of the amount: the two halves of an exchange look like income and an
// expense, and counting them as either would inflate both sides of the books.
const KIND_OF: Partial<Record<LedgerSource, TransactionKind>> = {
  payment: "income",
  due_received: "income",
  expense: "expense",
  team_payout: "expense",
  owner_withdrawal: "expense",
  due_payment: "expense",
  exchange_in: "transfer",
  exchange_out: "transfer",
}

const describe = (transaction: ITransaction) => transaction.description || SOURCE_LABEL[transaction.source_type]

// "client payment · income", or a note that the row counts as neither.
const sourceLine = (transaction: ITransaction) => {
  const kind = KIND_OF[transaction.source_type]
  const source = SOURCE_LABEL[transaction.source_type]
  return kind ? `${source} · ${kind}` : `${source} · counted in neither direction`
}

export const transactionsColumns: ColumnDef<ITransaction>[] = [
  {
    id: "date",
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => <span className="whitespace-nowrap">{formatDay(row.original.date)}</span>,
  },
  {
    id: "description",
    accessorFn: describe,
    header: "What happened",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate">{describe(row.original)}</p>
        <p className="text-xs text-muted-foreground">{sourceLine(row.original)}</p>
      </div>
    ),
  },
  {
    id: "account",
    accessorFn: (transaction) => transaction.account.name,
    header: "Account",
    // The currency travels with the account, so the Amount column stays a
    // plain number a spreadsheet can sum.
    meta: { exportValue: (transaction) => `${transaction.account.name} (${transaction.account.currency})` },
    cell: ({ row }) => (
      <span>
        {row.original.account.name}
        <span className="ml-1.5 text-xs text-muted-foreground">{row.original.account.currency}</span>
      </span>
    ),
  },
  {
    id: "amount",
    accessorKey: "amount",
    // Right-aligned with tabular figures, so amounts line up digit under
    // digit and a column of them can be read down.
    header: ({ column }) => (
      <div className="-mr-2 flex justify-end">
        <DataTableColumnHeader column={column} title="Amount" />
      </div>
    ),
    meta: { label: "Amount" },
    cell: ({ row }) => (
      <p className="text-right whitespace-nowrap tabular-nums">
        {formatMoney(row.original.amount, row.original.currency)}
      </p>
    ),
  },
]
