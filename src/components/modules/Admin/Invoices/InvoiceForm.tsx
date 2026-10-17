"use client"

import InvoiceLineItems from "@/components/modules/Admin/Invoices/InvoiceLineItems"
import InvoiceTextFields from "@/components/modules/Admin/Invoices/InvoiceTextFields"
import InvoiceTotals from "@/components/modules/Admin/Invoices/InvoiceTotals"
import { useInvoiceForm } from "@/components/modules/Admin/Invoices/useInvoiceForm"
import AppField from "@/components/shared/form/AppField"
import AppSubmitButton from "@/components/shared/form/AppSubmitButton"
import EntitySelect from "@/components/shared/form/EntitySelect"
import { Button } from "@/components/ui/button"
import { DialogClose, DialogFooter } from "@/components/ui/dialog"
import { clientsListQuery } from "@/queries/crm.queries"
import { projectsListQuery } from "@/queries/project.queries"
import type { IInvoice } from "@/types/billing.types"
import { invoiceFormZodSchema } from "@/zod/billing.validation"
import { useQuery } from "@tanstack/react-query"

type InvoiceFormProps = {
  /** Present to correct an invoice nothing has been paid against yet. */
  invoice?: IInvoice | null
  onDone: () => void
}

// There is no total field: the server works it out from the lines, so a
// client cannot send a wrong one into receivables.
const InvoiceForm = ({ invoice, onDone }: InvoiceFormProps) => {
  const { form, isPending } = useInvoiceForm(invoice, onDone)
  const { data: clientsData } = useQuery(clientsListQuery())
  const { data: projectsData } = useQuery(projectsListQuery())

  const clients = clientsData?.data ?? []
  const projects = projectsData?.data ?? []

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
      <form.Field name="client_id" validators={{ onChange: invoiceFormZodSchema.shape.client_id }}>
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
            options={projects.map((project) => ({ value: project.id, label: project.name, hint: project.code }))}
          />
        )}
      </form.Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <form.Field name="issue_date">
          {(field) => <AppField field={field} label="Issue date" type="date" disabled={isPending} />}
        </form.Field>

        <form.Field name="due_date">
          {(field) => <AppField field={field} label="Due date" type="date" disabled={isPending} />}
        </form.Field>
      </div>

      <InvoiceLineItems form={form} isPending={isPending} />

      <div className="grid gap-5 sm:grid-cols-2">
        <form.Field name="discount">
          {(field) => (
            <AppField field={field} label="Discount (USD)" type="number" placeholder="0.00" disabled={isPending} />
          )}
        </form.Field>

        <form.Field name="tax">
          {(field) => (
            <AppField field={field} label="Tax (USD)" type="number" placeholder="0.00" disabled={isPending} />
          )}
        </form.Field>
      </div>

      <InvoiceTotals form={form} />

      <InvoiceTextFields form={form} isPending={isPending} />

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={isPending}>
            Cancel
          </Button>
        </DialogClose>
        <AppSubmitButton isPending={isPending} pendingLabel={invoice ? "Saving..." : "Creating..."} className="w-auto">
          {invoice ? "Save changes" : "Create invoice"}
        </AppSubmitButton>
      </DialogFooter>
    </form>
  )
}

export default InvoiceForm
