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
import type { IDuePerson } from "@/types/spending.types"
import { dueTransactionFormZodSchema, type IDueTransactionFormValues } from "@/zod/spending.validation"
import { useActionMutation } from "@/hooks/useActionMutation"
import { useForm } from "@tanstack/react-form"
import { format } from "date-fns"
import { useQuery } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { useCallback, useState } from "react"
import { accountsQuery } from "@/queries/finance.queries"
import { queryKeys } from "@/lib/queryKeys"

/**
 * Informal lending, in and out.
 *
 * The sign convention is the thing to get right on screen: a POSITIVE balance
 * means the agency has taken more from that person than it has given back, so
 * the agency owes THEM. Showing a bare signed number would leave every reader
 * working that out from scratch, so each row says which way it points.
 */

// The user's own calendar day. toISOString() is UTC, which in Dhaka is still
// yesterday until 6am.
const today = () => format(new Date(), "yyyy-MM-dd")

const RecordTransactionModal = ({ people }: { people: IDuePerson[] }) => {
  const [open, setOpen] = useState(false)

  const { data: accountsData } = useQuery({ ...accountsQuery(), enabled: open })

  const bdtAccounts = ((accountsData?.data ?? [])).filter(
    (account) => account.currency === "BDT" && account.is_active,
  )

  const { run: recordTransaction, isPending } = useActionMutation({
    action: createDueTransactionAction,
    successMessage: "Transaction recorded",
    invalidateKeys: [queryKeys.duePeople.all, queryKeys.dueTransactions.all, queryKeys.accounts.all],
    refresh: false,
  })

  // Annotated rather than `satisfies`: the latter narrows `direction` to the
  // literal "received", so the form field could never be switched to "payment".
  const defaultValues: IDueTransactionFormValues = {
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
      // A failure keeps the dialog open with what was typed.
      if (await recordTransaction(value)) {
        setOpen(false)
        form.reset()
      }
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
                validators={{ onChange: dueTransactionFormZodSchema.shape.due_person_id }}
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
                      field.handleChange(value as IDueTransactionFormValues["direction"])
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
                  validators={{ onChange: dueTransactionFormZodSchema.shape.amount_bdt }}
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
                validators={{ onChange: dueTransactionFormZodSchema.shape.account_id }}
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
