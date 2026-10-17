"use client"

import { createPaymentAction } from "@/app/(dashboardLayout)/admin/dashboard/payments/_action"
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
import { formatBdt, formatRate } from "@/lib/currency"
import { paymentFormZodSchema, type IPaymentFormValues } from "@/zod/billing.validation"
import { useActionMutation } from "@/hooks/useActionMutation"
import { useForm } from "@tanstack/react-form"
import { format } from "date-fns"
import { useQuery } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { useCallback, useState } from "react"
import { clientsListQuery } from "@/queries/crm.queries"
import { projectsListQuery } from "@/queries/project.queries"
import { queryKeys } from "@/lib/queryKeys"
import { accountsQuery, rateSettingsQuery } from "@/queries/finance.queries"

// The user's own calendar day. toISOString() is UTC, which in Dhaka is still
// yesterday until 6am.
const today = () => format(new Date(), "yyyy-MM-dd")

const getDefaultValues = (): IPaymentFormValues => ({
  client_id: "",
  project_id: "",
  date: today(),
  amount_usd: "",
  reporting_rate: "",
  account_id: "",
  reference: "",
  notes: "",
})

const RecordPaymentModal = () => {
  const [open, setOpen] = useState(false)

  // Only fetched once the dialog opens — three lists nobody needs until then.
  const { data: clientsData } = useQuery({ ...clientsListQuery(), enabled: open })
  const { data: projectsData } = useQuery({ ...projectsListQuery(), enabled: open })
  const { data: accountsData } = useQuery({ ...accountsQuery(), enabled: open })
  const { data: rateData } = useQuery({ ...rateSettingsQuery(), enabled: open })

  const clients = clientsData?.data ?? []
  const projects = projectsData?.data ?? []
  const accounts = accountsData?.data ?? []
  const rates = rateData?.data

  // A payment is USD by definition, so a BDT wallet is never a valid choice.
  // Filtering here means the mistake cannot be made rather than being caught
  // by the server afterwards.
  const usdAccounts = accounts.filter((account) => account.currency === "USD" && account.is_active)

  const { run: recordPayment, isPending } = useActionMutation({
    action: createPaymentAction,
    successMessage: "Payment recorded successfully",
    // Balances, the dashboard and any invoice this settled all move.
    invalidateKeys: [
      queryKeys.payments.all,
      queryKeys.accounts.all,
      queryKeys.invoices.all,
      queryKeys.dashboard.all,
    ],
  })

  const form = useForm({
    defaultValues: getDefaultValues(),
    onSubmit: async ({ value }) => {
      // A failure keeps the dialog open with what was typed.
      if (await recordPayment(value)) {
        setOpen(false)
        form.reset()
      }
    },
  })

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen)
      if (!nextOpen) form.reset()
    },
    [form],
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" className="ml-auto shrink-0">
          <Plus className="size-4" />
          Record payment
        </Button>
      </DialogTrigger>

      <DialogContent
        className="max-h-[90vh] w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] gap-0 overflow-hidden p-0 sm:w-[calc(100vw-3rem)] sm:max-w-[calc(100vw-3rem)] lg:w-[min(88vw,36rem)] lg:max-w-[min(88vw,36rem)]"
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader className="border-b px-6 py-5 pr-14">
          <DialogTitle>Record payment</DialogTitle>
          <DialogDescription>
            Money in from a client, always USD. This credits a USD wallet — BDT only appears when
            you exchange.
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
              <form.Field name="client_id" validators={{ onChange: paymentFormZodSchema.shape.client_id }}>
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
                    description="Tie it to a project and it counts towards that project's profit."
                    options={projects.map((project) => ({
                      value: project.id,
                      label: project.name,
                      hint: project.code,
                    }))}
                  />
                )}
              </form.Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <form.Field name="date">
                  {(field) => <AppField field={field} label="Date" type="date" disabled={isPending} />}
                </form.Field>

                <form.Field
                  name="amount_usd"
                  validators={{ onChange: paymentFormZodSchema.shape.amount_usd }}
                >
                  {(field) => (
                    <AppField
                      field={field}
                      label="Amount (USD)"
                      type="number"
                      placeholder="0.00"
                      disabled={isPending}
                    />
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
                    emptyMessage="Add a USD account first"
                    description="Only USD accounts are listed — a payment cannot land in a BDT wallet."
                    options={usdAccounts.map((account) => ({
                      value: account.id,
                      label: account.name,
                      hint: account.type,
                    }))}
                    error={
                      field.state.meta.isTouched && field.state.meta.errors.length > 0
                        ? "Choose a USD account"
                        : null
                    }
                  />
                )}
              </form.Field>

              <form.Field name="reporting_rate">
                {(field) => (
                  <div className="space-y-1.5">
                    <AppField
                      field={field}
                      label="Reporting rate (optional)"
                      type="number"
                      placeholder={
                        rates?.effective_rate ? formatRate(rates.effective_rate) : "e.g. 119.50"
                      }
                      disabled={isPending}
                    />
                    <p className="text-xs text-muted-foreground">
                      {rates?.effective_rate
                        ? `Leave blank to use ${formatRate(rates.effective_rate)} (${
                              rates.effective_source === "manual" ? "your default" : "today's market rate"
                          }).`
                        : "Leave blank to use the agency default."}{" "}
                      This is only for reporting — it does not move any BDT.
                    </p>
                  </div>
                )}
              </form.Field>

              {/* A running preview of the BDT figure that will be frozen onto
                  the row, so the number is not a surprise afterwards. */}
              <form.Subscribe
                selector={(state) => [state.values.amount_usd, state.values.reporting_rate] as const}
              >
                {([amount, rate]) => {
                  const effective = Number(rate) || rates?.effective_rate || 0
                  const preview = Number(amount) * effective
                  if (!preview) return null
                  return (
                    <p className="rounded-lg bg-muted/60 px-3 py-2 text-sm text-muted-foreground">
                      Recorded for reporting as{" "}
                      <span className="font-medium text-foreground tabular-nums">
                        {formatBdt(preview)}
                      </span>{" "}
                      at {formatRate(effective)}.
                    </p>
                  )
                }}
              </form.Subscribe>

              <form.Field name="reference">
                {(field) => (
                  <AppField
                    field={field}
                    label="Reference"
                    placeholder="e.g. Milestone 2"
                    disabled={isPending}
                  />
                )}
              </form.Field>

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isPending}>
                    Cancel
                  </Button>
                </DialogClose>
                <AppSubmitButton isPending={isPending} pendingLabel="Recording..." className="w-auto">
                  Record payment
                </AppSubmitButton>
              </DialogFooter>
            </form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default RecordPaymentModal
