"use client"

import {
  createInvoiceAction,
  updateInvoiceAction,
} from "@/app/(dashboardLayout)/admin/dashboard/invoices/_action"
import { useActionMutation } from "@/hooks/useActionMutation"
import { todayIsoDate } from "@/lib/dates"
import { queryKeys } from "@/lib/queryKeys"
import type { IInvoice } from "@/types/billing.types"
import type { IInvoiceFormValues } from "@/zod/billing.validation"
import { useForm } from "@tanstack/react-form"
import { addDays } from "date-fns"

// The user's own calendar day, so a Dhaka morning is not still yesterday.
const inDays = (days: number) => todayIsoDate(addDays(new Date(), days))

const blankValues = (): IInvoiceFormValues => ({
  client_id: "",
  project_id: "",
  issue_date: inDays(0),
  due_date: inDays(14),
  discount: "",
  tax: "",
  notes: "",
  terms: "",
  items: [{ service_id: "", description: "", quantity: "1", unit_price: "" }],
})

const toFormValues = (invoice?: IInvoice | null): IInvoiceFormValues => {
  if (!invoice) return blankValues()

  return {
    client_id: invoice.client_id,
    project_id: invoice.project_id ?? "",
    issue_date: invoice.issue_date,
    due_date: invoice.due_date,
    discount: invoice.discount ? String(invoice.discount) : "",
    tax: invoice.tax ? String(invoice.tax) : "",
    notes: invoice.notes ?? "",
    terms: invoice.terms ?? "",
    items: (invoice.items ?? []).map((item) => ({
      service_id: item.service_id ?? "",
      description: item.description,
      quantity: String(item.quantity),
      unit_price: String(item.unit_price),
    })),
  }
}

// The invoice form and its save, for a new invoice and for correcting one. A
// failure keeps the form open with the lines already typed.
export const useInvoiceForm = (invoice: IInvoice | null | undefined, onDone: () => void) => {
  const { run: saveInvoice, isPending } = useActionMutation({
    action: (values: IInvoiceFormValues) =>
      invoice ? updateInvoiceAction(invoice.id, values) : createInvoiceAction(values),
    successMessage: invoice ? "Invoice updated" : "Invoice created",
    invalidateKeys: [queryKeys.invoices.all, queryKeys.clientFinancials.all, queryKeys.dashboard.all],
  })

  const form = useForm({
    defaultValues: toFormValues(invoice),
    onSubmit: async ({ value }) => {
      if (await saveInvoice(value)) onDone()
    },
  })

  return { form, isPending }
}

// What the invoice's field groups take as their form.
export type InvoiceFormApi = ReturnType<typeof useInvoiceForm>["form"]
