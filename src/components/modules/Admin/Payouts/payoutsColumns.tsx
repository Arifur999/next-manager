import DateCell from "@/components/shared/cell/DateCell"
import { Badge } from "@/components/ui/badge"
import { formatBdt } from "@/lib/currency"
import type { ITeamPayout } from "@/types/spending.types"
import { ColumnDef } from "@tanstack/react-table"

export const payoutsColumns: ColumnDef<ITeamPayout>[] = [
  {
    id: "date",
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => <DateCell date={row.original.date} formatString="MMM dd, yyyy" />,
  },
  {
    id: "member",
    accessorFn: (payout) => payout.user?.full_name ?? "",
    header: "Member",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-medium">{row.original.user?.full_name ?? "N/A"}</p>
        {row.original.project && (
          <p className="truncate text-xs text-muted-foreground">{row.original.project.code}</p>
        )}
      </div>
    ),
  },
  {
    id: "type",
    // The label people read, so search, sort and export all use it too.
    accessorFn: (payout) => payout.type.replace(/_/g, " "),
    header: "Type",
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {row.original.type.replace(/_/g, " ")}
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
    accessorFn: (payout) => payout.account?.name ?? "",
    header: "Paid from",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.account?.name ?? "N/A"}</span>
    ),
  },
]
