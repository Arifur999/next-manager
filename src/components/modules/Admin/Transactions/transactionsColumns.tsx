import DateCell from "@/components/shared/cell/DateCell"
import { Badge } from "@/components/ui/badge"
import { formatMoney } from "@/lib/currency"
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

const KIND_TONE = { income: "secondary", expense: "outline", transfer: "outline" } as const

const describe = (transaction: ITransaction) => transaction.description || SOURCE_LABEL[transaction.source_type]

export const transactionsColumns: ColumnDef<ITransaction>[] = [
  {
    id: "date",
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => <DateCell date={row.original.date} formatString="d MMM yyyy" />,
  },
  {
    id: "description",
    accessorFn: describe,
    header: "What happened",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate">{describe(row.original)}</p>
        <p className="text-xs text-muted-foreground">
          {SOURCE_LABEL[row.original.source_type]}
          {KIND_OF[row.original.source_type] ? "" : " · counted in neither direction"}
        </p>
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
    header: "Amount",
    cell: ({ row }) => {
      const kind = KIND_OF[row.original.source_type]
      return (
        <span className="whitespace-nowrap">
          <span className="tabular-nums">{formatMoney(row.original.amount, row.original.currency)}</span>
          {kind && (
            <Badge variant={KIND_TONE[kind]} className="ml-2 text-[10px]">
              {kind}
            </Badge>
          )}
        </span>
      )
    },
  },
]
