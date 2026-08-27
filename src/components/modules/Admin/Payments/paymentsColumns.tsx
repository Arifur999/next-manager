import DateCell from "@/components/shared/cell/DateCell"
import { Badge } from "@/components/ui/badge"
import { formatBdt, formatRate, formatUsd } from "@/lib/currency"
import type { IPayment } from "@/types/agencio.types"
import { ColumnDef } from "@tanstack/react-table"

export const paymentsColumns: ColumnDef<IPayment>[] = [
  {
    id: "date",
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => <DateCell date={row.original.date} formatString="MMM dd, yyyy" />,
  },
  {
    id: "client",
    header: "Client",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-medium">{row.original.client?.name ?? "N/A"}</p>
        {row.original.project && (
          <p className="truncate text-xs text-muted-foreground">{row.original.project.code}</p>
        )}
      </div>
    ),
  },
  {
    id: "amount_usd",
    accessorKey: "amount_usd",
    header: "Amount",
    cell: ({ row }) => (
      <span className="font-medium tabular-nums">{formatUsd(row.original.amount_usd)}</span>
    ),
  },
  {
    id: "reporting_rate",
    header: "Rate",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground tabular-nums">
        {formatRate(row.original.reporting_rate)}
      </span>
    ),
  },
  {
    id: "amount_bdt_reporting",
    header: "BDT (reporting)",
    enableSorting: false,
    cell: ({ row }) => (
      // Muted on purpose: this is a frozen reporting figure, not money that
      // exists in a BDT wallet. Styling it like the USD column would suggest
      // the agency holds it.
      <span className="text-sm text-muted-foreground tabular-nums">
        {formatBdt(row.original.amount_bdt_reporting)}
      </span>
    ),
  },
  {
    id: "account",
    header: "Into",
    enableSorting: false,
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.account?.name ?? "N/A"}</Badge>
    ),
  },
  {
    id: "reference",
    accessorKey: "reference",
    header: "Reference",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.reference || "N/A"}</span>
    ),
  },
]
