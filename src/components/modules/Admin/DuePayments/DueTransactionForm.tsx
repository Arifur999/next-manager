"use client"

import { createDueTransactionAction } from "@/app/(dashboardLayout)/admin/dashboard/due-payments/_action"
import { useAccountOptions } from "@/components/modules/Admin/Money/useAccountOptions"
import AppField from "@/components/shared/form/AppField"
import AppSubmitButton from "@/components/shared/form/AppSubmitButton"
import EntitySelect from "@/components/shared/form/EntitySelect"
import { Button } from "@/components/ui/button"
import { DialogClose, DialogFooter } from "@/components/ui/dialog"
import { useActionMutation } from "@/hooks/useActionMutation"
import { todayIsoDate } from "@/lib/dates"
import { queryKeys } from "@/lib/queryKeys"
import { ledgerQueryKeys } from "@/queries/finance.queries"
import type { IDuePerson } from "@/types/spending.types"
import { dueTransactionFormZodSchema, type IDueTransactionFormValues } from "@/zod/spending.validation"
import { useForm } from "@tanstack/react-form"

// Recording money lent or borrowed. There is no editing one: it moved real
// money, so the API corrects it as a delete (which reverses it) plus a new entry.
const DueTransactionForm = ({ people, onDone }: { people: IDuePerson[]; onDone: () => void }) => {
  const bdtAccounts = useAccountOptions("BDT")

  const { run: recordTransaction, isPending } = useActionMutation({
    action: createDueTransactionAction,
    successMessage: "Transaction recorded",
    invalidateKeys: [queryKeys.duePeople.all, queryKeys.dueTransactions.all, ...ledgerQueryKeys],
    refresh: false,
  })

  // Annotated rather than `satisfies`: the latter narrows `direction` to the
  // literal "received", so the form field could never be switched to "payment".
  const defaultValues: IDueTransactionFormValues = {
    due_person_id: "",
    date: todayIsoDate(),
    direction: "received",
    amount_bdt: "",
    account_id: "",
    notes: "",
  }

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      // A failure keeps the dialog open with what was typed.
      if (await recordTransaction(value)) onDone()
    },
  })

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
            onChange={field.handleChange}
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
            emptyMessage={bdtAccounts.emptyMessage}
            options={bdtAccounts.options}
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
  )
}

export default DueTransactionForm
