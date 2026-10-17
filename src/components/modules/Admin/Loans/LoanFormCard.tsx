"use client"

import AppField from "@/components/shared/form/AppField"
import AppSubmitButton from "@/components/shared/form/AppSubmitButton"
import EntitySelect from "@/components/shared/form/EntitySelect"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import type { IAccount } from "@/types/finance.types"
import { loanFormZodSchema, type ILoanFormValues } from "@/zod/finance.validation"
import { useForm } from "@tanstack/react-form"
import { format } from "date-fns"

/**
 * Recording a loan.
 *
 * The account is optional, and that is deliberate: a loan already part repaid
 * when it is first entered never landed in an account here, and picking one
 * would invent money that never arrived.
 *
 * A schedule is generated from the term as a starting point, with interest left
 * at zero rather than guessed — a made-up interest figure would flow straight
 * into profit and loss. The agency then corrects the rows to match the paper it
 * actually signed.
 */
const LoanFormCard = ({
  accounts,
  onSubmit,
  isPending,
}: {
  accounts: IAccount[]
  // Resolves true once the loan is saved.
  onSubmit: (values: ILoanFormValues) => Promise<boolean>
  isPending: boolean
}) => {
  const defaultValues: ILoanFormValues = {
    lender: "",
    principal_bdt: "",
    interest_rate: "",
    started_on: format(new Date(), "yyyy-MM-dd"),
    term_months: "12",
    account_id: "",
  }

  const form = useForm({
    defaultValues,
    validators: { onSubmit: loanFormZodSchema },
    onSubmit: async ({ value, formApi }) => {
      // A refusal keeps what was typed, so it can be corrected rather than
      // retyped. A success clears the loan itself and keeps the term, start
      // and account, which the next loan often shares.
      if (await onSubmit(value)) {
        formApi.reset({ ...value, lender: "", principal_bdt: "", interest_rate: "" }, { keepDefaultValues: true })
      }
    },
  })

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Record a loan</CardTitle>
        <p className="text-sm text-muted-foreground">
          A bank loan or EMI. Money lent between people belongs on Due Payments — that has
          no schedule, no interest and no term.
        </p>
      </CardHeader>

      <form
        method="POST"
        action="#"
        noValidate
        className="space-y-4 px-6 pb-6"
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          form.handleSubmit()
        }}
      >
        <form.Field name="lender">
          {(field) => (
            <AppField field={field} label="Who lent it" placeholder="City Bank" disabled={isPending} />
          )}
        </form.Field>

        <form.Field name="principal_bdt">
          {(field) => <AppField field={field} label="Amount" type="number" disabled={isPending} />}
        </form.Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <form.Field name="term_months">
            {(field) => <AppField field={field} label="Months" type="number" disabled={isPending} />}
          </form.Field>

          <form.Field name="interest_rate">
            {(field) => (
              <AppField
                field={field}
                label="Rate a year (%)"
                type="number"
                placeholder="0"
                disabled={isPending}
              />
            )}
          </form.Field>
        </div>

        <form.Field name="started_on">
          {(field) => <AppField field={field} label="Started on" type="date" disabled={isPending} />}
        </form.Field>

        <form.Field name="account_id">
          {(field) => (
            <EntitySelect
              id={field.name}
              label="Paid into"
              value={field.state.value ?? ""}
              onChange={field.handleChange}
              disabled={isPending}
              placeholder="Nowhere — already part repaid"
              emptyMessage="Nowhere — already part repaid"
              description="Leave it empty for a loan you are entering after the fact. Choosing an account puts the money into it — the cash is real, but it is borrowed, so it never counts as revenue."
              options={accounts.map((account) => ({ value: account.id, label: account.name }))}
            />
          )}
        </form.Field>

        {/* Pressable once there is a lender and an amount, as before. */}
        <form.Subscribe
          selector={(state) => !state.values.lender.trim() || !Number(state.values.principal_bdt)}
        >
          {(isIncomplete) => (
            <AppSubmitButton isPending={isPending} pendingLabel="Recording..." disabled={isIncomplete}>
              Record it
            </AppSubmitButton>
          )}
        </form.Subscribe>

        <p className="text-xs text-muted-foreground">
          A schedule is filled in for the whole term with interest at zero. Edit the rows
          to match your bank&apos;s own table — a guessed interest figure would land
          straight in your profit.
        </p>
      </form>
    </Card>
  )
}

export default LoanFormCard
