import InvoiceStatusBadge from "@/components/modules/Admin/Invoices/InvoiceStatusBadge"
import { shownInvoiceStatus } from "@/components/modules/Admin/Invoices/invoiceStatus"
import { formatUsd } from "@/lib/currency"
import { formatDay } from "@/lib/dates"
import { sentenceCase } from "@/lib/text"
import type { IInvoice, InvoiceStatus } from "@/types/billing.types"
import { ColumnDef } from "@tanstack/react-table"

const INVOICE_STATUSES: InvoiceStatus[] = ["draft", "sent", "partially_paid", "paid", "overdue", "cancelled"]

export const INVOICE_STATUS_OPTIONS = INVOICE_STATUSES.map((status) => ({ label: sentenceCase(status), value: status }))

export const invoicesColumns: ColumnDef<IInvoice>[] = [
  {
    id: "invoice_number",
    accessorKey: "invoice_number",
    header: "Invoice",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-medium">{row.original.invoice_number}</p>
        <p className="truncate text-xs text-muted-foreground">{row.original.client?.name ?? "N/A"}</p>
      </div>
    ),
  },
  {
    id: "issue_date",
    accessorKey: "issue_date",
    header: "Issued",
    meta: { priority: "low" },
    cell: ({ row }) => <span className="whitespace-nowrap">{formatDay(row.original.issue_date)}</span>,
  },
  {
    id: "due_date",
    accessorKey: "due_date",
    header: "Due",
    cell: ({ row }) => (
      <span className={row.original.is_overdue ? "whitespace-nowrap text-destructive" : "whitespace-nowrap"}>
        {formatDay(row.original.due_date)}
      </span>
    ),
  },
  {
    id: "status",
    accessorFn: shownInvoiceStatus,
    header: "Status",
    cell: ({ row }) => <InvoiceStatusBadge invoice={row.original} />,
  },
  {
    id: "total",
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => <span className="font-medium tabular-nums">{formatUsd(row.original.total)}</span>,
  },
]
