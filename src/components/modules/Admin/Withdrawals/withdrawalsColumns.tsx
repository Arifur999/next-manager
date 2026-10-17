import { Badge } from "@/components/ui/badge"
import { formatBdt } from "@/lib/currency"
import { formatDay } from "@/lib/dates"
import { sentenceCase } from "@/lib/text"
import type { IOwnerWithdrawal } from "@/types/spending.types"
import { ColumnDef } from "@tanstack/react-table"

export const withdrawalsColumns: ColumnDef<IOwnerWithdrawal>[] = [
  {
    id: "date",
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => <span className="whitespace-nowrap">{formatDay(row.original.date)}</span>,
  },
  {
    id: "type",
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => <Badge variant="outline">{sentenceCase(row.original.type)}</Badge>,
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
    accessorFn: (withdrawal) => withdrawal.account?.name ?? "",
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
    meta: { priority: "low" },
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.notes || "—"}</span>
    ),
  },
]
