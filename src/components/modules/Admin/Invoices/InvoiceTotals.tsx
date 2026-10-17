"use client"

import type { InvoiceFormApi } from "@/components/modules/Admin/Invoices/useInvoiceForm"
import { formatUsd } from "@/lib/currency"

// A preview only: the server recomputes the total from the same lines, and
// its figure is the one that gets stored.
const InvoiceTotals = ({ form }: { form: InvoiceFormApi }) => (
  <form.Subscribe
    selector={(state) =>
      [state.values.items, state.values.discount, state.values.tax] as const
    }
  >
    {([items, discount, tax]) => {
      const subtotal = items.reduce(
        (running, item) =>
          running + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0),
        0,
      )
      const total = subtotal - Number(discount || 0) + Number(tax || 0)

      return (
        <div className="rounded-lg bg-muted/60 px-4 py-3 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatUsd(subtotal)}</span>
          </div>
          <div className="mt-1 flex justify-between font-medium">
            <span>Total</span>
            <span className="tabular-nums">{formatUsd(total)}</span>
          </div>
          {total < 0 && (
            <p className="mt-2 text-xs text-destructive">
              The discount is larger than the subtotal — the server will refuse this.
            </p>
          )}
        </div>
      )
    }}
  </form.Subscribe>
)

export default InvoiceTotals
