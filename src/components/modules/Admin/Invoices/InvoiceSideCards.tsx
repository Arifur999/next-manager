import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { formatUsd } from "@/lib/currency"
import { formatDay } from "@/lib/dates"
import { cn } from "@/lib/utils"
import type { IInvoice } from "@/types/billing.types"

// The figures and dates a client reads first: what it comes to, what is
// still owed, and by when.
export const InvoiceSummaryCard = ({ invoice }: { invoice: IInvoice }) => (
  <Card className="p-5">
    <div>
      <p className="text-2xl font-semibold tabular-nums">{formatUsd(invoice.total)}</p>
      <p className="text-sm text-muted-foreground tabular-nums">
        {invoice.status === "cancelled" ? "Cancelled, nothing owed" : `${formatUsd(invoice.due_usd ?? 0)} still due`}
      </p>
    </div>

    <dl className="space-y-3 text-sm">
      <div>
        <dt className="text-xs text-muted-foreground">Issued</dt>
        <dd>{formatDay(invoice.issue_date)}</dd>
      </div>
      <div>
        <dt className="text-xs text-muted-foreground">Due</dt>
        <dd className={cn(invoice.is_overdue && "text-destructive")}>{formatDay(invoice.due_date)}</dd>
      </div>
      {invoice.client?.email && (
        <div>
          <dt className="text-xs text-muted-foreground">Billed to</dt>
          <dd className="truncate">{invoice.client.email}</dd>
        </div>
      )}
    </dl>
  </Card>
)

// Internal only, so it never prints: the client is sent the invoice, not the
// agency's view of its own books.
export const InvoicePaymentsCard = ({ invoice }: { invoice: IInvoice }) => {
  const payments = invoice.payments ?? []

  return (
    <Card className="gap-0 overflow-hidden p-0" data-print="hide">
      <CardHeader className="border-b px-5 py-4">
        <CardTitle className="text-base">Payments against it</CardTitle>
      </CardHeader>

      {payments.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-muted-foreground">Nothing paid yet.</p>
      ) : (
        <ul className="divide-y">
          {payments.map((payment) => (
            <li key={payment.id} className="px-5 py-3">
              <p className="text-sm tabular-nums">{formatUsd(payment.amount_usd)}</p>
              <p className="text-xs text-muted-foreground">
                {formatDay(payment.date)}
                {payment.reference ? ` · ${payment.reference}` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}

      <p className="border-t px-5 py-3 text-xs text-muted-foreground">
        Status follows these payments, so a paid invoice always has the money behind it. Only cancelling is
        decided by hand.
      </p>
    </Card>
  )
}
