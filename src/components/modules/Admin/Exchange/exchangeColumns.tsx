import DateCell from "@/components/shared/cell/DateCell"
import { Badge } from "@/components/ui/badge"
import { formatBdt, formatRate, formatUsd } from "@/lib/currency"
import type { IExchange } from "@/types/agencio.types"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowRight } from "lucide-react"

export const exchangeColumns: ColumnDef<IExchange>[] = [
  {
    id: "date",
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => <DateCell date={row.original.date} formatString="MMM dd, yyyy" />,
  },
  {
    id: "route",
    header: "From → To",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-sm">
        <Badge variant="outline">{row.original.from_account?.name ?? "N/A"}</Badge>
        <ArrowRight className="size-3.5 text-muted-foreground" aria-hidden="true" />
        <Badge variant="outline">{row.original.to_account?.name ?? "N/A"}</Badge>
      </div>
    ),
  },
  {
    id: "amount_usd",
    accessorKey: "amount_usd",
    header: "Sent",
    cell: ({ row }) => (
      <span className="font-medium tabular-nums">{formatUsd(row.original.amount_usd)}</span>
    ),
  },
  {
    id: "fee_usd",
    header: "Fee",
    enableSorting: false,
    cell: ({ row }) =>
      row.original.fee_usd > 0 ? (
        <span className="text-sm text-muted-foreground tabular-nums">
          {formatUsd(row.original.fee_usd)}
        </span>
      ) : (
        <span className="text-sm text-muted-foreground">—</span>
      ),
  },
  {
    id: "rate",
    accessorKey: "rate",
    header: "Rate",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">{formatRate(row.original.rate)}</span>
    ),
  },
  {
    id: "amount_bdt",
    header: "Received",
    enableSorting: false,
    cell: ({ row }) => (
      // Full weight, unlike the reporting column on payments: this BDT is
      // really in a wallet.
      <span className="font-medium tabular-nums">{formatBdt(row.original.amount_bdt)}</span>
    ),
  },
]
