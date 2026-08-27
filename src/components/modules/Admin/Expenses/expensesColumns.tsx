import DateCell from "@/components/shared/cell/DateCell"
import { Badge } from "@/components/ui/badge"
import { formatBdt } from "@/lib/currency"
import type { IExpense } from "@/types/agencio.types"
import { ColumnDef } from "@tanstack/react-table"

export const expensesColumns: ColumnDef<IExpense>[] = [
  {
    id: "date",
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => <DateCell date={row.original.date} formatString="MMM dd, yyyy" />,
  },
  {
    id: "category",
    header: "Category",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Badge variant="outline">{row.original.category?.name ?? "N/A"}</Badge>
        {/* Employee-type costs are flagged because reports treat them
            separately from operating expenses. */}
        {row.original.category?.type === "employee" && (
          <span className="text-xs text-muted-foreground">employee</span>
        )}
      </div>
    ),
  },
  {
    id: "vendor",
    accessorKey: "vendor",
    header: "Vendor",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate text-sm">{row.original.vendor || "N/A"}</p>
        {row.original.project && (
          <p className="truncate text-xs text-muted-foreground">{row.original.project.code}</p>
        )}
      </div>
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
    header: "Paid from",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.account?.name ?? "N/A"}</span>
    ),
  },
]
