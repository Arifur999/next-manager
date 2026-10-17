"use client"

import AppField from "@/components/shared/form/AppField"
import AppSubmitButton from "@/components/shared/form/AppSubmitButton"
import EntitySelect from "@/components/shared/form/EntitySelect"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import InvoiceLineItems from "@/components/modules/Admin/Invoices/InvoiceLineItems"
import InvoiceTotals from "@/components/modules/Admin/Invoices/InvoiceTotals"
import { useInvoiceForm } from "@/components/modules/Admin/Invoices/useInvoiceForm"
import { invoiceFormZodSchema } from "@/zod/billing.validation"
import { useQuery } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { useCallback, useState } from "react"
import { clientsListQuery } from "@/queries/crm.queries"
import { projectsListQuery } from "@/queries/project.queries"

// Creating an invoice. There is no total field: the server works it out from
// the lines, so a client cannot send a wrong one into receivables.
const CreateInvoiceModal = () => {
  const [open, setOpen] = useState(false)

  const { data: clientsData } = useQuery({ ...clientsListQuery(), enabled: open })
  const { data: projectsData } = useQuery({ ...projectsListQuery(), enabled: open })

  const clients = clientsData?.data ?? []
  const projects = projectsData?.data ?? []

  const { form, isPending } = useInvoiceForm(() => setOpen(false))

  const handleOpenChange = useCallback(
    (next: boolean) => {
      setOpen(next)
      if (!next) form.reset()
    },
    [form],
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" className="ml-auto shrink-0">
          <Plus className="size-4" />
          New invoice
        </Button>
      </DialogTrigger>

      <DialogContent
        className="max-h-[90vh] w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] gap-0 overflow-hidden p-0 sm:w-[calc(100vw-3rem)] sm:max-w-[calc(100vw-3rem)] lg:w-[min(88vw,42rem)] lg:max-w-[min(88vw,42rem)]"
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader className="border-b px-6 py-5 pr-14">
          <DialogTitle>New invoice</DialogTitle>
          <DialogDescription>
            Billed in USD. The number is generated for you, and the total comes from the lines.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-5.5rem)]">
          <div className="px-6 py-5">
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
                validators={{ onChange: invoiceFormZodSchema.shape.client_id }}
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
                    error={
                      field.state.meta.isTouched && field.state.meta.errors.length > 0
                        ? "Choose a client"
                        : null
                    }
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
                    options={projects.map((project) => ({
                      value: project.id,
                      label: project.name,
                      hint: project.code,
                    }))}
                  />
                )}
              </form.Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <form.Field name="issue_date">
                  {(field) => (
                    <AppField field={field} label="Issue date" type="date" disabled={isPending} />
                  )}
                </form.Field>

                <form.Field name="due_date">
                  {(field) => (
                    <AppField field={field} label="Due date" type="date" disabled={isPending} />
                  )}
                </form.Field>
              </div>

              <InvoiceLineItems form={form} isPending={isPending} />

              <div className="grid gap-5 sm:grid-cols-2">
                <form.Field name="discount">
                  {(field) => (
                    <AppField
                      field={field}
                      label="Discount (USD)"
                      type="number"
                      placeholder="0.00"
                      disabled={isPending}
                    />
                  )}
                </form.Field>

                <form.Field name="tax">
                  {(field) => (
                    <AppField
                      field={field}
                      label="Tax (USD)"
                      type="number"
                      placeholder="0.00"
                      disabled={isPending}
                    />
                  )}
                </form.Field>
              </div>

              <InvoiceTotals form={form} />

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isPending}>
                    Cancel
                  </Button>
                </DialogClose>
                <AppSubmitButton isPending={isPending} pendingLabel="Creating..." className="w-auto">
                  Create invoice
                </AppSubmitButton>
              </DialogFooter>
            </form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default CreateInvoiceModal
