"use client"

import { useAccountOptions } from "@/components/modules/Admin/Money/useAccountOptions"
import PaymentRateField from "@/components/modules/Admin/Payments/PaymentRateField"
import { usePaymentForm } from "@/components/modules/Admin/Payments/usePaymentForm"
import AppField from "@/components/shared/form/AppField"
import AppSubmitButton from "@/components/shared/form/AppSubmitButton"
import EntitySelect from "@/components/shared/form/EntitySelect"
import { Button } from "@/components/ui/button"
import { DialogClose, DialogFooter } from "@/components/ui/dialog"
import { formatUsd } from "@/lib/currency"
import { formatDay } from "@/lib/dates"
import { invoicesListQuery } from "@/queries/billing.queries"
import { clientsListQuery } from "@/queries/crm.queries"
import { projectsListQuery } from "@/queries/project.queries"
import type { IInvoice, IPayment } from "@/types/billing.types"
import { paymentFormZodSchema } from "@/zod/billing.validation"
import { useQuery } from "@tanstack/react-query"

// Only what is still owed can be paid; the invoice an edited payment already
// pays stays listed whatever its status now.
const payableInvoices = (invoices: IInvoice[], clientId: string, currentId: string) =>
  invoices.filter(
    (invoice) =>
      invoice.client_id === clientId &&
      (invoice.id === currentId || invoice.status === "sent" || invoice.status === "partially_paid"),
  )

type PaymentFormProps = {
  /** Present to correct a recorded payment. */
  payment?: IPayment | null
  /** Present to pay this invoice: client, invoice and amount come prefilled. */
  invoice?: IInvoice | null
  onDone: () => void
}

const PaymentForm = ({ payment, invoice, onDone }: PaymentFormProps) => {
  const { data: clientsData } = useQuery(clientsListQuery())
  const { data: projectsData } = useQuery(projectsListQuery())
  const { data: invoicesData } = useQuery(invoicesListQuery())
  // A payment is USD by definition, so a BDT wallet is never offered.
  const usdAccounts = useAccountOptions("USD", payment?.account_id)

  const clients = clientsData?.data ?? []
  const projects = projectsData?.data ?? []
  const invoices = invoicesData?.data ?? []

  const { form, isPending } = usePaymentForm({ payment, invoice, onDone })

  return (
    <form
      method="POST"
      action="#"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-5"
    >
      <form.Field
        name="client_id"
        validators={{ onChange: paymentFormZodSchema.shape.client_id }}
        // Another client's invoice can never be the one this pays.
        listeners={{ onChange: () => form.setFieldValue("invoice_id", "") }}
      >
        {(field) => (
          <EntitySelect
            id={field.name}
            label="Client"
            value={field.state.value}
            onChange={field.handleChange}
            disabled={isPending}
            emptyMessage="Add a client first"
            options={clients.map((client) => ({
              value: client.id,
              label: client.name,
              hint: client.company || undefined,
            }))}
            error={field.state.meta.isTouched && field.state.meta.errors.length > 0 ? "Choose a client" : null}
          />
        )}
      </form.Field>

      <form.Subscribe selector={(state) => state.values.client_id}>
        {(clientId) => (
          <form.Field name="invoice_id">
            {(field) => (
              <EntitySelect
                id={field.name}
                label="Invoice it pays (optional)"
                value={field.state.value ?? ""}
                onChange={field.handleChange}
                disabled={isPending || !clientId}
                placeholder="Not against an invoice"
                emptyMessage={clientId ? "Nothing owed by this client" : "Choose the client first"}
                description="The invoice's status follows the payments against it."
                options={payableInvoices(invoices, clientId, payment?.invoice_id ?? "").map((option) => ({
                  value: option.id,
                  label: `${option.invoice_number} · ${formatUsd(option.total)}`,
                  hint: `due ${formatDay(option.due_date)}`,
                }))}
              />
            )}
          </form.Field>
        )}
      </form.Subscribe>

      <form.Field name="project_id">
        {(field) => (
          <EntitySelect
            id={field.name}
            label="Project (optional)"
            value={field.state.value ?? ""}
            onChange={field.handleChange}
            disabled={isPending}
            placeholder="Not tied to a project"
            emptyMessage="No projects yet"
            description="Tie it to a project and it counts towards that project's profit."
            options={projects.map((project) => ({ value: project.id, label: project.name, hint: project.code }))}
          />
        )}
      </form.Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <form.Field name="date">
          {(field) => <AppField field={field} label="Date" type="date" disabled={isPending} />}
        </form.Field>

        <form.Field name="amount_usd" validators={{ onChange: paymentFormZodSchema.shape.amount_usd }}>
          {(field) => (
            <AppField field={field} label="Amount (USD)" type="number" placeholder="0.00" disabled={isPending} />
          )}
        </form.Field>
      </div>

      <form.Field name="account_id" validators={{ onChange: paymentFormZodSchema.shape.account_id }}>
        {(field) => (
          <EntitySelect
            id={field.name}
            label="Into which USD wallet"
            value={field.state.value}
            onChange={field.handleChange}
            disabled={isPending}
            emptyMessage={usdAccounts.emptyMessage}
            description="Only USD accounts are listed — a payment cannot land in a BDT wallet."
            options={usdAccounts.options}
            error={field.state.meta.isTouched && field.state.meta.errors.length > 0 ? "Choose a USD account" : null}
          />
        )}
      </form.Field>

      <PaymentRateField form={form} isPending={isPending} />

      <form.Field name="reference">
        {(field) => <AppField field={field} label="Reference" placeholder="e.g. Milestone 2" disabled={isPending} />}
      </form.Field>

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={isPending}>
            Cancel
          </Button>
        </DialogClose>
        <AppSubmitButton
          isPending={isPending}
          pendingLabel={payment ? "Saving..." : "Recording..."}
          className="w-auto"
        >
          {payment ? "Save changes" : "Record payment"}
        </AppSubmitButton>
      </DialogFooter>
    </form>
  )
}

export default PaymentForm
