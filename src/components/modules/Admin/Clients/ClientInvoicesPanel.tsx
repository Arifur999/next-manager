"use client"

import EmptyState from "@/components/shared/state/EmptyState"
import PanelState from "@/components/shared/state/PanelState"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { formatUsd } from "@/lib/currency"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { FileText } from "lucide-react"
import Link from "next/link"
import { invoicesListQuery } from "@/queries/billing.queries"

// The invoices endpoint filters by search text rather than client id, so the
// list is narrowed here.
const ClientInvoicesPanel = ({ clientId }: { clientId: string }) => {
  const invoicesQuery = useQuery(invoicesListQuery())

  const invoices = (invoicesQuery.data?.data ?? []).filter((invoice) => invoice.client_id === clientId)

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <PanelState
        query={invoicesQuery}
        errorMessage="The invoices did not load."
        isEmpty={invoices.length === 0}
        empty={<EmptyState icon={FileText}>No invoices raised for this client yet.</EmptyState>}
      >
        <ul className="divide-y">
          {invoices.map((invoice) => (
            <li key={invoice.id}>
              <Link
                href={`/admin/dashboard/invoices/${invoice.id}`}
                className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-muted/50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{invoice.invoice_number}</p>
                  <p className="text-xs text-muted-foreground">
                    due {format(new Date(invoice.due_date), "MMM dd, yyyy")}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <Badge
                    variant="outline"
                    className={`capitalize ${invoice.is_overdue ? "border-destructive text-destructive" : ""}`}
                  >
                    {(invoice.is_overdue ? "overdue" : invoice.status).replace(/_/g, " ")}
                  </Badge>
                  <span className="text-sm tabular-nums">{formatUsd(invoice.total)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </PanelState>
    </Card>
  )
}

export default ClientInvoicesPanel
