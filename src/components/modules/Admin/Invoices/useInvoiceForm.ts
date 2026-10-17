"use client"

import { createInvoiceAction } from "@/app/(dashboardLayout)/admin/dashboard/invoices/_action"
import { useActionMutation } from "@/hooks/useActionMutation"
import { queryKeys } from "@/lib/queryKeys"
import type { IInvoiceFormValues } from "@/zod/billing.validation"
import { useForm } from "@tanstack/react-form"

const today = () => new Date().toISOString().slice(0, 10)
const inDays = (days: number) =>
  new Date(Date.now() + days * 86400000).toISOString().slice(0, 10)

const defaultValues: IInvoiceFormValues = {
  client_id: "",
  project_id: "",
  issue_date: today(),
  due_date: inDays(14),
  discount: "",
  tax: "",
  notes: "",
  items: [{ description: "", quantity: "1", unit_price: "" }],
}

// The new-invoice form and its save. onCreated runs once the invoice exists;
// a failure keeps the form open with the lines already typed.
export const useInvoiceForm = (onCreated: () => void) => {
  const { run: createInvoice, isPending } = useActionMutation({
    action: createInvoiceAction,
    successMessage: "Invoice created successfully",
    invalidateKeys: [queryKeys.invoices.all, queryKeys.dashboard.all],
  })

  const form = useForm({
    defaultValues,
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
