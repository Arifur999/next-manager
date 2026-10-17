"use client"

import AppField from "@/components/shared/form/AppField"
import AppSubmitButton from "@/components/shared/form/AppSubmitButton"
import EntitySelect from "@/components/shared/form/EntitySelect"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import type { IAccount, IShareholder } from "@/types/finance.types"
import { distributionFormZodSchema, type IDistributionFormValues } from "@/zod/finance.validation"
import { useForm } from "@tanstack/react-form"
import { todayIsoDate } from "@/lib/dates"

const DistributionFormCard = ({
  shareholders,
  accounts,
  onSubmit,
  isPending,
}: {
  shareholders: IShareholder[]
  accounts: IAccount[]
  // Resolves true once the distribution is recorded.
  onSubmit: (values: IDistributionFormValues) => Promise<boolean>
  isPending: boolean
}) => {
  const defaultValues: IDistributionFormValues = {
    shareholder_id: "",
    date: todayIsoDate(),
    amount_bdt: "",
    account_id: "",
  }

  const form = useForm({
    defaultValues,
    validators: { onSubmit: distributionFormZodSchema },
    onSubmit: async ({ value, formApi }) => {
      // Only the amount clears: the next payment is often to the same person,
      // from the same account, on the same day.
      if (await onSubmit(value)) {
        formApi.reset({ ...value, amount_bdt: "" }, { keepDefaultValues: true })
      }
    },
  })

  const activeShareholders = shareholders.filter((shareholder) => shareholder.is_active)

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Pay a distribution</CardTitle>
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
        <form.Field name="shareholder_id">
          {(field) => (
            <EntitySelect
              id={field.name}
              label="Who"
              value={field.state.value}
              onChange={field.handleChange}
              disabled={isPending}
              placeholder="Choose"
              emptyMessage="Add a shareholder first"
              options={activeShareholders.map((shareholder) => ({
                value: shareholder.id,
                label: `${shareholder.name} (${shareholder.share_pct}%)`,
              }))}
            />
          )}
        </form.Field>

        <form.Field name="amount_bdt">
          {(field) => <AppField field={field} label="Amount" type="number" disabled={isPending} />}
        </form.Field>

        <form.Field name="date">
          {(field) => <AppField field={field} label="Date" type="date" disabled={isPending} />}
        </form.Field>

        <form.Field name="account_id">
          {(field) => (
            <EntitySelect
              id={field.name}
              label="Paid from"
              value={field.state.value}
              onChange={field.handleChange}
              disabled={isPending}
              placeholder="Choose"
              emptyMessage="Add a BDT account first"
              options={accounts.map((account) => ({ value: account.id, label: account.name }))}
            />
          )}
        </form.Field>

        {/* Pressable once who, how much and from where are all filled in, as before. */}
        <form.Subscribe
          selector={(state) =>
            !state.values.shareholder_id || !state.values.account_id || !Number(state.values.amount_bdt)
          }
        >
          {(isIncomplete) => (
            <AppSubmitButton isPending={isPending} pendingLabel="Paying..." disabled={isIncomplete}>
              Pay it
            </AppSubmitButton>
          )}
        </form.Subscribe>

        <p className="text-xs text-muted-foreground">
          This moves money out of that account, but it is not a cost — your profit for
          the month does not change because you paid yourself.
        </p>
      </form>
    </Card>
  )
}

export default DistributionFormCard
