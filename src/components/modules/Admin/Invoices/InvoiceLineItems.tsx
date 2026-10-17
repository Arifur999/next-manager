"use client"

import type { InvoiceFormApi } from "@/components/modules/Admin/Invoices/useInvoiceForm"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2 } from "lucide-react"

// The invoice's lines: what is billed, how many and at what price. The
// total is never typed; it comes from these.
const InvoiceLineItems = ({ form, isPending }: { form: InvoiceFormApi; isPending: boolean }) => (
  <form.Field name="items" mode="array">
    {(itemsField) => (
      <div className="space-y-3">
        <Label>Lines</Label>

        {itemsField.state.value.map((_, index) => (
          <div key={index} className="flex items-start gap-2">
            <form.Field name={`items[${index}].description`}>
              {(field) => (
                <Input
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="What is being billed"
                  disabled={isPending}
                  className="flex-1"
                  aria-label={`Line ${index + 1} description`}
                />
              )}
            </form.Field>

            <form.Field name={`items[${index}].quantity`}>
              {(field) => (
                <Input
                  type="number"
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="Qty"
                  disabled={isPending}
                  className="w-20"
                  aria-label={`Line ${index + 1} quantity`}
                />
              )}
            </form.Field>

            <form.Field name={`items[${index}].unit_price`}>
              {(field) => (
                <Input
                  type="number"
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="Price"
                  disabled={isPending}
                  className="w-28"
                  aria-label={`Line ${index + 1} unit price`}
                />
              )}
            </form.Field>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              // The last line cannot be removed: the server refuses
              // an invoice with no lines, so removing it would only
              // produce a failure at submit.
              disabled={isPending || itemsField.state.value.length === 1}
              onClick={() => itemsField.removeValue(index)}
            >
              <Trash2 className="size-4" />
              <span className="sr-only">Remove line {index + 1}</span>
            </Button>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() =>
            itemsField.pushValue({ description: "", quantity: "1", unit_price: "" })
          }
        >
          <Plus className="size-3.5" />
          Add line
        </Button>
      </div>
    )}
  </form.Field>
)

export default InvoiceLineItems
