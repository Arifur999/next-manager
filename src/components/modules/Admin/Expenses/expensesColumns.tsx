import { Badge } from "@/components/ui/badge"
import { formatBdt } from "@/lib/currency"
import { formatDay } from "@/lib/dates"
import { toSafeExternalUrl } from "@/lib/safeUrl"
import type { IExpense } from "@/types/spending.types"
import { ColumnDef } from "@tanstack/react-table"
import { ExternalLink } from "lucide-react"

// Only an http(s) link becomes clickable; anything else stored is shown as text.
const ReceiptLink = ({ url }: { url: string }) => {
  const safeUrl = toSafeExternalUrl(url)
  if (!url) return <span className="text-sm text-muted-foreground">—</span>
  if (!safeUrl) return <span className="block max-w-40 truncate text-sm text-muted-foreground">{url}</span>

  return (
    <a
      href={safeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
    >
      Open
      <ExternalLink className="size-3.5" aria-hidden="true" />
      <span className="sr-only"> receipt, opens in a new tab</span>
    </a>
  )
}

export const expensesColumns: ColumnDef<IExpense>[] = [
  {
    id: "date",
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => <span className="whitespace-nowrap">{formatDay(row.original.date)}</span>,
  },
  {
    id: "category",
    accessorFn: (expense) => expense.category?.name ?? "",
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
    meta: { exportValue: (expense) => expense.account?.name, priority: "low" },
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.account?.name ?? "N/A"}</span>
    ),
  },
  {
    id: "receipt",
    accessorKey: "receipt_url",
    header: "Receipt",
    enableSorting: false,
    meta: { priority: "low" },
    cell: ({ row }) => <ReceiptLink url={row.original.receipt_url} />,
  },
]
