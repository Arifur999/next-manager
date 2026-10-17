"use client"

import type { InvoiceFormApi } from "@/components/modules/Admin/Invoices/useInvoiceForm"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const FIELDS = [
  {
    name: "notes",
    label: "Notes (optional)",
    placeholder: "e.g. Thank you for the work this month.",
  },
  {
    name: "terms",
    label: "Payment terms (optional)",
    placeholder: "e.g. Net 14. Bank transfer or PayPal.",
  },
] as const

// The two free-text blocks printed under the lines, for the client to read.
const InvoiceTextFields = ({ form, isPending }: { form: InvoiceFormApi; isPending: boolean }) => (
  <div className="grid gap-5 sm:grid-cols-2">
    {FIELDS.map(({ name, label, placeholder }) => (
      <form.Field key={name} name={name}>
        {(field) => (
          <div className="space-y-1.5">
            <Label htmlFor={field.name}>{label}</Label>
            <Textarea
              id={field.name}
              name={field.name}
              rows={3}
              placeholder={placeholder}
              value={field.state.value ?? ""}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              disabled={isPending}
            />
          </div>
        )}
      </form.Field>
    ))}
  </div>
)

export default InvoiceTextFields
