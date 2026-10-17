"use client"

import {
  createWithdrawalAction,
  updateWithdrawalAction,
} from "@/app/(dashboardLayout)/admin/dashboard/withdrawals/_action"
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
import type { IOwnerWithdrawal } from "@/types/spending.types"
import { ownerWithdrawalFormZodSchema, type IOwnerWithdrawalFormValues } from "@/zod/spending.validation"
import { useForm } from "@tanstack/react-form"

const WITHDRAWAL_TYPES = [
  { value: "personal", label: "Personal" },
  { value: "reinvestment", label: "Reinvestment" },
] as const

const toFormValues = (withdrawal?: IOwnerWithdrawal | null): IOwnerWithdrawalFormValues => ({
  date: withdrawal?.date ?? todayIsoDate(),
  amount_bdt: withdrawal ? String(withdrawal.amount_bdt) : "",
  type: withdrawal?.type ?? "personal",
  account_id: withdrawal?.account_id ?? "",
  notes: withdrawal?.notes ?? "",
})

type WithdrawalFormProps = {
  /** Present to correct a recorded withdrawal. */
  withdrawal?: IOwnerWithdrawal | null
  onDone: () => void
}

const WithdrawalForm = ({ withdrawal, onDone }: WithdrawalFormProps) => {
  const bdtAccounts = useAccountOptions("BDT", withdrawal?.account_id)

  const { run: saveWithdrawal, isPending } = useActionMutation({
    action: (values: IOwnerWithdrawalFormValues) =>
      withdrawal ? updateWithdrawalAction(withdrawal.id, values) : createWithdrawalAction(values),
    successMessage: withdrawal ? "Withdrawal updated" : "Withdrawal recorded",
    invalidateKeys: [queryKeys.withdrawals.all, ...ledgerQueryKeys],
  })

  const form = useForm({
    defaultValues: toFormValues(withdrawal),
    onSubmit: async ({ value }) => {
      // A failure keeps the dialog open with what was typed.
      if (await saveWithdrawal(value)) onDone()
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
      <div className="grid gap-5 sm:grid-cols-2">
        <form.Field name="date">
          {(field) => <AppField field={field} label="Date" type="date" disabled={isPending} />}
        </form.Field>

        <form.Field name="amount_bdt" validators={{ onChange: ownerWithdrawalFormZodSchema.shape.amount_bdt }}>
          {(field) => (
            <AppField field={field} label="Amount (BDT)" type="number" placeholder="0.00" disabled={isPending} />
          )}
        </form.Field>
      </div>

      <form.Field name="type">
        {(field) => (
          <EntitySelect
            id={field.name}
            label="Type"
            value={field.state.value}
            onChange={field.handleChange}
            disabled={isPending}
            description="Reinvestment goes back into the business; personal does not."
            options={WITHDRAWAL_TYPES}
          />
        )}
      </form.Field>

      <form.Field name="account_id" validators={{ onChange: ownerWithdrawalFormZodSchema.shape.account_id }}>
        {(field) => (
          <EntitySelect
            id={field.name}
            label="Taken from"
            value={field.state.value}
            onChange={field.handleChange}
            disabled={isPending}
            emptyMessage={bdtAccounts.emptyMessage}
            options={bdtAccounts.options}
            error={field.state.meta.isTouched && field.state.meta.errors.length > 0 ? "Choose a BDT account" : null}
          />
        )}
      </form.Field>

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={isPending}>
            Cancel
          </Button>
        </DialogClose>
        <AppSubmitButton isPending={isPending} pendingLabel={withdrawal ? "Saving..." : "Recording..."} className="w-auto">
          {withdrawal ? "Save changes" : "Record withdrawal"}
        </AppSubmitButton>
      </DialogFooter>
    </form>
  )
}

export default WithdrawalForm
