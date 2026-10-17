"use client"

import { createExchangeAction } from "@/app/(dashboardLayout)/admin/dashboard/exchange/_action"
import { useAccountOptions } from "@/components/modules/Admin/Money/useAccountOptions"
import AppField from "@/components/shared/form/AppField"
import AppSubmitButton from "@/components/shared/form/AppSubmitButton"
import EntitySelect from "@/components/shared/form/EntitySelect"
import { Button } from "@/components/ui/button"
import { DialogClose, DialogFooter } from "@/components/ui/dialog"
import { useActionMutation } from "@/hooks/useActionMutation"
import { formatBdt, formatRate, formatUsd } from "@/lib/currency"
import { todayIsoDate } from "@/lib/dates"
import { queryKeys } from "@/lib/queryKeys"
import { ledgerQueryKeys, rateSettingsQuery } from "@/queries/finance.queries"
import { exchangeFormFields, exchangeFormZodSchema, type IExchangeFormValues } from "@/zod/finance.validation"
import { useForm } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"

const getDefaultValues = (): IExchangeFormValues => ({
  date: todayIsoDate(),
  from_account_id: "",
  to_account_id: "",
  amount_usd: "",
  rate: "",
  fee_usd: "",
  notes: "",
})

// Recording an exchange. There is no editing one: the API keeps a wrong
// exchange as a reversal plus a new entry, which is delete and record again.
const ExchangeForm = ({ onDone }: { onDone: () => void }) => {
  const { data: rateData } = useQuery(rateSettingsQuery())
  const usdAccounts = useAccountOptions("USD")
  const bdtAccounts = useAccountOptions("BDT")
  const rates = rateData?.data

  // The server refuses an overdraw and says how much is actually there; that
  // message is what the failure toast shows.
  const { run: recordExchange, isPending } = useActionMutation({
    action: createExchangeAction,
    successMessage: "Exchange recorded",
    invalidateKeys: [queryKeys.exchanges.all, ...ledgerQueryKeys],
  })

  const form = useForm({
    defaultValues: getDefaultValues(),
    validators: {
      // The fee-vs-amount rule spans two fields, so it lives on the form rather
      // than on either one of them.
      onSubmit: exchangeFormZodSchema,
    },
    onSubmit: async ({ value }) => {
      if (await recordExchange(value)) onDone()
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
      <form.Field name="date">
        {(field) => <AppField field={field} label="Date" type="date" disabled={isPending} />}
      </form.Field>

      <form.Field name="from_account_id">
        {(field) => (
          <EntitySelect
            id={field.name}
            label="From (USD)"
            value={field.state.value}
            onChange={field.handleChange}
            disabled={isPending}
            emptyMessage={usdAccounts.emptyMessage}
            options={usdAccounts.options}
            error={
              field.state.meta.isTouched && field.state.meta.errors.length > 0
                ? "Choose the USD account"
                : null
            }
          />
        )}
      </form.Field>

      <form.Field name="to_account_id">
        {(field) => (
          <EntitySelect
            id={field.name}
            label="To (BDT)"
            value={field.state.value}
            onChange={field.handleChange}
            disabled={isPending}
            emptyMessage={bdtAccounts.emptyMessage}
            options={bdtAccounts.options}
            error={
              field.state.meta.isTouched && field.state.meta.errors.length > 0
                ? "Choose the BDT account"
                : null
            }
          />
        )}
      </form.Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <form.Field
          name="amount_usd"
          validators={{ onChange: exchangeFormFields.shape.amount_usd }}
        >
          {(field) => (
            <AppField
              field={field}
              label="Amount sent (USD)"
              type="number"
              placeholder="0.00"
              disabled={isPending}
            />
          )}
        </form.Field>

        <form.Field name="fee_usd">
          {(field) => (
            <AppField
              field={field}
              label="Processor fee (USD)"
              type="number"
              placeholder="0.00"
              disabled={isPending}
            />
          )}
        </form.Field>
      </div>

      <form.Field
        name="rate"
        validators={{ onChange: exchangeFormFields.shape.rate }}
      >
        {(field) => (
          <div className="space-y-1.5">
            <AppField
              field={field}
              label="Rate you actually got"
              type="number"
              placeholder="e.g. 117.40"
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">
              Not pre-filled on purpose.
              {rates?.effective_rate
                ? ` Today's market rate is ${formatRate(rates.effective_rate)}, but PayPal and Payoneer pay less than that — type what actually landed.`
                : " Type what actually landed, not the market rate — processors pay less."}
            </p>
          </div>
        )}
      </form.Field>

      {/* What will actually reach the BDT wallet, worked out the same
          way the server does it: (amount - fee) * rate. */}
      <form.Subscribe
        selector={(state) =>
          [state.values.amount_usd, state.values.fee_usd, state.values.rate] as const
        }
      >
        {([amount, fee, rate]) => {
          const net = Number(amount || 0) - Number(fee || 0)
          const bdt = net * Number(rate || 0)
          if (!bdt || net <= 0) return null
          return (
            <p className="rounded-lg bg-muted/60 px-3 py-2 text-sm text-muted-foreground">
              {formatUsd(Number(amount))} leaves the USD wallet and{" "}
              <span className="font-medium text-foreground tabular-nums">
                {formatBdt(bdt)}
              </span>{" "}
              lands in BDT.
            </p>
          )
        }}
      </form.Subscribe>

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={isPending}>
            Cancel
          </Button>
        </DialogClose>
        <AppSubmitButton isPending={isPending} pendingLabel="Recording..." className="w-auto">
          Record exchange
        </AppSubmitButton>
      </DialogFooter>
    </form>
  )
}

export default ExchangeForm
