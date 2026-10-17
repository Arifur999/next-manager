"use client"

import { createInvoiceAction } from "@/app/(dashboardLayout)/admin/dashboard/invoices/_action"
import { useActionMutation } from "@/hooks/useActionMutation"
import { queryKeys } from "@/lib/queryKeys"
import type { IInvoiceFormValues } from "@/zod/billing.validation"
import { useForm } from "@tanstack/react-form"
import { addDays, format } from "date-fns"

// The user's own calendar days. toISOString() is UTC, which in Dhaka is still
// yesterday until 6am.
const inDays = (days: number) => format(addDays(new Date(), days), "yyyy-MM-dd")

const getDefaultValues = (): IInvoiceFormValues => ({
  client_id: "",
  project_id: "",
  issue_date: inDays(0),
  due_date: inDays(14),
  discount: "",
  tax: "",
  notes: "",
  items: [{ description: "", quantity: "1", unit_price: "" }],
})

// The new-invoice form and its save. onCreated runs once the invoice exists;
// a failure keeps the form open with the lines already typed.
export const useInvoiceForm = (onCreated: () => void) => {
  const { run: createInvoice, isPending } = useActionMutation({
    action: createInvoiceAction,
    successMessage: "Invoice created successfully",
    invalidateKeys: [queryKeys.invoices.all, queryKeys.dashboard.all],
  })

  const form = useForm({
    defaultValues: getDefaultValues(),
    onSubmit: async ({ value, formApi }) => {
      if (await createInvoice(value)) {
        onCreated()
        formApi.reset()
      }
    },
  })

  return { form, isPending }
}

// What the invoice's field groups take as their form.
export type InvoiceFormApi = ReturnType<typeof useInvoiceForm>["form"]
