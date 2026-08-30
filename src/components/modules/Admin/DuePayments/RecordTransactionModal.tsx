"use client"

import { createDueTransactionAction } from "@/app/(dashboardLayout)/admin/dashboard/due-payments/_action"
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
import { formatBdt } from "@/lib/currency"
import { getAccounts } from "@/services/agencio.services"
import type { IAccount, IDuePerson } from "@/types/agencio.types"
import { useForm } from "@tanstack/react-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { useCallback, useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

/**
 * Informal lending, in and out.
 *
 * The sign convention is the thing to get right on screen: a POSITIVE balance
 * means the agency has taken more from that person than it has given back, so
 * the agency owes THEM. Showing a bare signed number would leave every reader
 * working that out from scratch, so each row says which way it points.
 */

const transactionSchema = z.object({
  due_person_id: z.string().min(1, "Choose a person"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date"),
  direction: z.enum(["received", "payment"]),
  amount_bdt: z
    .string()
    .min(1, "Amount is required")
    .refine((value) => Number.isFinite(Number(value)), "Amount must be a number")
    .refine((value) => Number(value) > 0, "Amount must be greater than zero"),
  account_id: z.string().min(1, "Choose a BDT account"),
  notes: z.string().optional(),
})

type TransactionValues = z.infer<typeof transactionSchema>

const today = () => new Date().toISOString().slice(0, 10)

const RecordTransactionModal = ({ people }: { people: IDuePerson[] }) => {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: accountsData } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => getAccounts(),
    enabled: open,
  })

  const bdtAccounts = ((accountsData?.data ?? []) as IAccount[]).filter(
    (account) => account.currency === "BDT" && account.is_active,
  )

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (values: TransactionValues) =>
      createDueTransactionAction({ ...values, amount_bdt: Number(values.amount_bdt) }),
  })

  // Annotated rather than `satisfies`: the latter narrows `direction` to the
  // literal "received", so the form field could never be switched to "payment".
  const defaultValues: TransactionValues = {
    due_person_id: "",
    date: today(),
    direction: "received",
    amount_bdt: "",
    account_id: "",
    notes: "",
  }

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      const result = await mutateAsync(value)

      if (!result.success) {
        toast.error(result.message || "Failed to record transaction")
        return
      }

      toast.success("Transaction recorded")
      setOpen(false)
      form.reset()

      void queryClient.invalidateQueries({ queryKey: ["due-people"] })
      void queryClient.invalidateQueries({ queryKey: ["due-transactions"] })
      void queryClient.invalidateQueries({ queryKey: ["accounts"] })
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
        <Button type="button" className="shrink-0">
          <Plus className="size-4" />
          Record transaction
        </Button>
      </DialogTrigger>

      <DialogContent
        className="max-h-[90vh] overflow-hidden p-0"
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader className="border-b px-6 py-5 pr-14">
          <DialogTitle>Record transaction</DialogTitle>
          <DialogDescription>
            From the agency&apos;s point of view: received is money in, payment is money out.
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
                name="due_person_id"
                validators={{ onChange: transactionSchema.shape.due_person_id }}
              >
                {(field) => (
                  <EntitySelect
                    id={field.name}
                    label="Person"
                    value={field.state.value}
                    onChange={field.handleChange}
                    disabled={isPending}
                    emptyMessage="Add a person first"
                    options={people.map((person) => ({
                      value: person.id,
                      label: person.name,
                      hint: person.phone || undefined,
                    }))}
                    error={
                      field.state.meta.isTouched && field.state.meta.errors.length > 0
                        ? "Choose a person"
                        : null
                    }
                  />
                )}
              </form.Field>

              <form.Field name="direction">
                {(field) => (
                  <EntitySelect
                    id={field.name}
                    label="Direction"
                    value={field.state.value}
                    onChange={(value) =>
                      field.handleChange(value as TransactionValues["direction"])
                    }
                    disabled={isPending}
                    options={[
                      { value: "received", label: "Received", hint: "Money came in" },
                      { value: "payment", label: "Payment", hint: "Money went out" },
                    ]}
                  />
                )}
              </form.Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <form.Field name="date">
                  {(field) => <AppField field={field} label="Date" type="date" disabled={isPending} />}
                </form.Field>

                <form.Field
                  name="amount_bdt"
                  validators={{ onChange: transactionSchema.shape.amount_bdt }}
                >
                  {(field) => (
                    <AppField
                      field={field}
                      label="Amount (BDT)"
                      type="number"
                      placeholder="0.00"
                      disabled={isPending}
                    />
                  )}
                </form.Field>
              </div>

              <form.Field
                name="account_id"
                validators={{ onChange: transactionSchema.shape.account_id }}
              >
                {(field) => (
                  <EntitySelect
                    id={field.name}
                    label="Account"
                    value={field.state.value}
                    onChange={field.handleChange}
                    disabled={isPending}
                    emptyMessage="Add a BDT account first"
                    options={bdtAccounts.map((account) => ({
                      value: account.id,
                      label: account.name,
                      hint: formatBdt(account.balance),
                    }))}
                    error={
                      field.state.meta.isTouched && field.state.meta.errors.length > 0
                        ? "Choose a BDT account"
                        : null
                    }
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
                  Record
                </AppSubmitButton>
              </DialogFooter>
            </form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default RecordTransactionModal
