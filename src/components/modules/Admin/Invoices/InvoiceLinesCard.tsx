import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { formatUsd } from "@/lib/currency"
import type { IInvoice } from "@/types/billing.types"

// What was billed, line by line, and the totals the server worked out from it.
const InvoiceLinesCard = ({ invoice }: { invoice: IInvoice }) => (
  <Card className="gap-0 overflow-hidden p-0">
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
              <td className="px-5 py-2.5 text-right tabular-nums">{formatUsd(item.unit_price)}</td>
              <td className="px-5 py-2.5 text-right font-medium tabular-nums">{formatUsd(item.amount)}</td>
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
          <dd className="tabular-nums">{formatUsd(-invoice.discount)}</dd>
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

    {(invoice.notes || invoice.terms) && (
      <div className="grid gap-4 border-t px-5 py-4 text-sm sm:grid-cols-2">
        {invoice.notes && (
          <div>
            <p className="text-xs text-muted-foreground">Notes</p>
            <p className="mt-1 whitespace-pre-line">{invoice.notes}</p>
          </div>
        )}
        {invoice.terms && (
          <div>
            <p className="text-xs text-muted-foreground">Payment terms</p>
            <p className="mt-1 whitespace-pre-line">{invoice.terms}</p>
          </div>
        )}
      </div>
    )}
  </Card>
)

export default InvoiceLinesCard
