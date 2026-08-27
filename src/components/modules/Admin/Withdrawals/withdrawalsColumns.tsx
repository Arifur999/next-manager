import DateCell from "@/components/shared/cell/DateCell"
import { Badge } from "@/components/ui/badge"
import { formatBdt } from "@/lib/currency"
import type { IOwnerWithdrawal } from "@/types/agencio.types"
import { ColumnDef } from "@tanstack/react-table"

export const withdrawalsColumns: ColumnDef<IOwnerWithdrawal>[] = [
  {
    id: "date",
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => <DateCell date={row.original.date} formatString="MMM dd, yyyy" />,
  },
  {
    id: "type",
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {row.original.type}
      </Badge>
    ),
  },
  {
    id: "amount_bdt",
    accessorKey: "amount_bdt",
    header: "Amount",
    cell: ({ row }) => (
      <span className="font-medium tabular-nums">{formatBdt(row.original.amount_bdt)}</span>
    ),
  },
  {
    id: "account",
    header: "Taken from",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.account?.name ?? "N/A"}</span>
    ),
  },
  {
    id: "notes",
    accessorKey: "notes",
    header: "Notes",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.notes || "—"}</span>
    ),
  },
]
