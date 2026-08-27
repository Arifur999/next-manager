"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { formatUsd } from "@/lib/currency"
import { getInvoice } from "@/services/agencio.services"
import type { IInvoice } from "@/types/agencio.types"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import Link from "next/link"

const InvoiceDetail = ({ invoiceId }: { invoiceId: string }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["invoice", invoiceId],
    queryFn: () => getInvoice(invoiceId),
  })

  const invoice = data?.data as IInvoice | undefined

  if (isLoading && !invoice) {
    return <Card className="h-64 animate-pulse bg-muted/40" />
  }

  if (!invoice) return null

  const status = invoice.is_overdue ? "overdue" : invoice.status

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{invoice.invoice_number}</h1>
            <Badge
              variant="outline"
              className={`capitalize ${invoice.is_overdue ? "border-destructive text-destructive" : ""}`}
            >
              {status.replace(/_/g, " ")}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {invoice.client?.name}
            {invoice.project ? ` · ${invoice.project.code}` : ""}
          </p>
        </div>

        <div className="text-right">
          <p className="text-2xl font-semibold tabular-nums">{formatUsd(invoice.total)}</p>
          <p className="text-sm text-muted-foreground tabular-nums">
            {formatUsd(invoice.due_usd ?? 0)} still due
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="gap-0 overflow-hidden p-0 lg:col-span-2">
          <CardHeader className="border-b px-5 py-4">
            <CardTitle className="text-base">Lines</CardTitle>
          </CardHeader>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-5 py-2 font-medium">Description</th>
                  <th className="px-5 py-2 text-right font-medium">Qty</th>
                  <th className="px-5 py-2 text-right font-medium">Unit</th>
                  <th className="px-5 py-2 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(invoice.items ?? []).map((item) => (
                  <tr key={item.id}>
                    <td className="px-5 py-2.5">{item.description}</td>
                    <td className="px-5 py-2.5 text-right tabular-nums">{item.quantity}</td>
                    <td className="px-5 py-2.5 text-right tabular-nums">
                      {formatUsd(item.unit_price)}
                    </td>
                    <td className="px-5 py-2.5 text-right font-medium tabular-nums">
                      {formatUsd(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <dl className="space-y-1 border-t px-5 py-4 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <dt>Subtotal</dt>
              <dd className="tabular-nums">{formatUsd(invoice.subtotal)}</dd>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <dt>Discount</dt>
                <dd className="tabular-nums">−{formatUsd(invoice.discount)}</dd>
              </div>
            )}
            {invoice.tax > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <dt>Tax</dt>
                <dd className="tabular-nums">{formatUsd(invoice.tax)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t pt-2 font-medium">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatUsd(invoice.total)}</dd>
            </div>
          </dl>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Issued</dt>
                <dd>{format(new Date(invoice.issue_date), "MMM dd, yyyy")}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Due</dt>
                <dd className={invoice.is_overdue ? "text-destructive" : undefined}>
                  {format(new Date(invoice.due_date), "MMM dd, yyyy")}
                </dd>
              </div>
              {invoice.client?.email && (
                <div>
                  <dt className="text-xs text-muted-foreground">Billed to</dt>
                  <dd className="truncate">{invoice.client.email}</dd>
                </div>
              )}
            </dl>
          </Card>

          <Card className="gap-0 overflow-hidden p-0">
            <CardHeader className="border-b px-5 py-4">
              <CardTitle className="text-base">Payments against it</CardTitle>
            </CardHeader>

            {(invoice.payments ?? []).length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                Nothing paid yet.{" "}
                <Link
                  href="/admin/dashboard/payments"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Record a payment
                </Link>
                .
              </p>
            ) : (
              <ul className="divide-y">
                {(invoice.payments ?? []).map((payment) => (
                  <li key={payment.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <p className="text-sm tabular-nums">{formatUsd(payment.amount_usd)}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(payment.date), "MMM dd, yyyy")}
                        {payment.reference ? ` · ${payment.reference}` : ""}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <p className="border-t px-5 py-3 text-xs text-muted-foreground">
              Status follows these payments — it is never set by hand, so a paid invoice always has
              the money behind it.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default InvoiceDetail
