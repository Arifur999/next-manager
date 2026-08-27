import DateCell from "@/components/shared/cell/DateCell"
import { formatUsd } from "@/lib/currency"
import type { IInvoice, InvoiceStatus } from "@/types/agencio.types"
import { ColumnDef } from "@tanstack/react-table"

// Status is a state, so it takes state colours: paid is good, overdue is
// serious, cancelled is inert. These are not categorical series hues.
const STATUS_TONE: Record<InvoiceStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-chart-1/12 text-chart-1",
  partially_paid: "bg-chart-2/15 text-chart-2",
  paid: "bg-chart-3/15 text-chart-3",
  overdue: "bg-destructive/12 text-destructive",
  cancelled: "bg-muted text-muted-foreground line-through",
}

export const invoicesColumns: ColumnDef<IInvoice>[] = [
  {
    id: "invoice_number",
    accessorKey: "invoice_number",
    header: "Invoice",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-medium">{row.original.invoice_number}</p>
        <p className="truncate text-xs text-muted-foreground">
          {row.original.client?.name ?? "N/A"}
        </p>
      </div>
    ),
  },
  {
    id: "issue_date",
    accessorKey: "issue_date",
    header: "Issued",
    cell: ({ row }) => <DateCell date={row.original.issue_date} formatString="MMM dd, yyyy" />,
  },
  {
    id: "due_date",
    accessorKey: "due_date",
    header: "Due",
    cell: ({ row }) => (
      <span className={row.original.is_overdue ? "text-destructive" : undefined}>
        <DateCell date={row.original.due_date} formatString="MMM dd, yyyy" />
      </span>
    ),
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      // is_overdue is derived from today's date on the server, so it can be
      // true while status still reads "sent". Showing the derived state is
      // the honest one.
      const label = row.original.is_overdue ? "overdue" : row.original.status
      const tone = row.original.is_overdue ? STATUS_TONE.overdue : STATUS_TONE[row.original.status]

      return (
        <span className={`rounded-md px-2 py-0.5 text-xs font-medium capitalize ${tone}`}>
          {label.replace(/_/g, " ")}
        </span>
      )
    },
  },
  {
    id: "total",
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => (
      <span className="font-medium tabular-nums">{formatUsd(row.original.total)}</span>
    ),
  },
]
