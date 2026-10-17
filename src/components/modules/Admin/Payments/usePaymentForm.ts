"use client"

import {
  createPaymentAction,
  updatePaymentAction,
} from "@/app/(dashboardLayout)/admin/dashboard/payments/_action"
import { useActionMutation } from "@/hooks/useActionMutation"
import { todayIsoDate } from "@/lib/dates"
import { queryKeys } from "@/lib/queryKeys"
import { ledgerQueryKeys } from "@/queries/finance.queries"
import type { IInvoice, IPayment } from "@/types/billing.types"
import type { IPaymentFormValues } from "@/zod/billing.validation"
import { useForm } from "@tanstack/react-form"

// An edit starts from the record; a payment for an invoice starts from what
// the invoice still owes; otherwise the form starts blank on today.
const toFormValues = (payment?: IPayment | null, invoice?: IInvoice | null): IPaymentFormValues => {
  if (payment) {
    return {
      client_id: payment.client_id,
      project_id: payment.project_id ?? "",
      invoice_id: payment.invoice_id ?? "",
      date: payment.date,
      amount_usd: String(payment.amount_usd),
      // The rate frozen on the row, so an edit never re-prices it by accident.
      reporting_rate: String(payment.reporting_rate),
      account_id: payment.account_id,
      reference: payment.reference ?? "",
      notes: payment.notes ?? "",
    }
  }

  return {
    client_id: invoice?.client_id ?? "",
    project_id: invoice?.project_id ?? "",
    invoice_id: invoice?.id ?? "",
    date: todayIsoDate(),
    amount_usd: invoice ? String(invoice.due_usd ?? invoice.total) : "",
    reporting_rate: "",
    account_id: "",
    reference: invoice?.invoice_number ?? "",
    notes: "",
  }
}

type UsePaymentFormOptions = {
  payment?: IPayment | null
  invoice?: IInvoice | null
  onDone: () => void
}

// The payment form and its save, for recording and for correcting. A failure
// keeps the form open with what was typed.
export const usePaymentForm = ({ payment, invoice, onDone }: UsePaymentFormOptions) => {
  const { run: savePayment, isPending } = useActionMutation({
    action: (values: IPaymentFormValues) =>
      payment ? updatePaymentAction(payment.id, values) : createPaymentAction(values),
    successMessage: payment ? "Payment updated" : "Payment recorded",
    // Any invoice it pays moves too, as does the client's own money tab.
    invalidateKeys: [queryKeys.payments.all, queryKeys.invoices.all, queryKeys.clientFinancials.all, ...ledgerQueryKeys],
  })

  const form = useForm({
    defaultValues: toFormValues(payment, invoice),
    onSubmit: async ({ value }) => {
      if (await savePayment(value)) onDone()
    },
  })

  return { form, isPending }
}

// What the payment's field groups take as their form.
export type PaymentFormApi = ReturnType<typeof usePaymentForm>["form"]
