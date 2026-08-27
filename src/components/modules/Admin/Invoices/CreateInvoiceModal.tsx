"use client"

import { createInvoiceAction } from "@/app/(dashboardLayout)/admin/dashboard/invoices/_action"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatUsd } from "@/lib/currency"
import { getClients, getProjects } from "@/services/agencio.services"
import type { IClient, IProject } from "@/types/agencio.types"
import { useForm } from "@tanstack/react-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

/**
 * Creating an invoice.
 *
 * The total is NOT a field. It is worked out from the line items here for the
 * preview, and worked out again on the server from the same items — the server's
 * figure is the one that counts. A client that could send its own total could
 * send a wrong one straight into receivables.
 */

const itemSchema = z.object({
  description: z.string().min(1, "Describe the line"),
  quantity: z.string().min(1, "Qty"),
  unit_price: z.string().min(1, "Price"),
})

const invoiceFormSchema = z.object({
  client_id: z.string().min(1, "Choose a client"),
  project_id: z.string().optional(),
  issue_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date"),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date"),
  discount: z.string().optional(),
  tax: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(itemSchema).min(1, "Add at least one line"),
})

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>

const today = () => new Date().toISOString().slice(0, 10)
const inDays = (days: number) =>
  new Date(Date.now() + days * 86400000).toISOString().slice(0, 10)

const defaultValues: InvoiceFormValues = {
  client_id: "",
  project_id: "",
  issue_date: today(),
  due_date: inDays(14),
  discount: "",
  tax: "",
  notes: "",
  items: [{ description: "", quantity: "1", unit_price: "" }],
}

const CreateInvoiceModal = () => {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const router = useRouter()

  const { data: clientsData } = useQuery({
    queryKey: ["clients", ""],
    queryFn: () => getClients(),
    enabled: open,
  })
  const { data: projectsData } = useQuery({
    queryKey: ["projects", ""],
    queryFn: () => getProjects(),
    enabled: open,
  })

  const clients = (clientsData?.data ?? []) as IClient[]
  const projects = (projectsData?.data ?? []) as IProject[]

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (values: InvoiceFormValues) =>
      createInvoiceAction({
        ...values,
        project_id: values.project_id || null,
        discount: values.discount ? Number(values.discount) : 0,
        tax: values.tax ? Number(values.tax) : 0,
        status: "sent",
        items: values.items.map((item, index) => ({
          description: item.description,
          quantity: Number(item.quantity) || 1,
          unit_price: Number(item.unit_price) || 0,
          sort_order: index,
        })),
      }),
  })

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      const result = await mutateAsync(value)

      if (!result.success) {
        toast.error(result.message || "Failed to create invoice")
        return
      }

      toast.success(result.message || "Invoice created")
      setOpen(false)
      form.reset()

      void queryClient.invalidateQueries({ queryKey: ["invoices"] })
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      router.refresh()
    },
  })

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
                validators={{ onChange: invoiceFormSchema.shape.client_id }}
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

              {/* A preview only — the server recomputes this from the same
                  lines, and its figure is the one that gets stored. */}
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
