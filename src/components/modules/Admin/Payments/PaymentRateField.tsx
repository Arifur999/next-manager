"use client"

import type { PaymentFormApi } from "@/components/modules/Admin/Payments/usePaymentForm"
import AppField from "@/components/shared/form/AppField"
import { formatBdt, formatRate } from "@/lib/currency"
import { rateSettingsQuery } from "@/queries/finance.queries"
import { useQuery } from "@tanstack/react-query"

// The reporting rate, and a running preview of the BDT figure that will be
// frozen onto the row, so the number is not a surprise afterwards.
const PaymentRateField = ({ form, isPending }: { form: PaymentFormApi; isPending: boolean }) => {
  const { data: rateData } = useQuery(rateSettingsQuery())
  const rates = rateData?.data

  const rateSource = rates?.effective_source === "manual" ? "your default" : "today's market rate"
  const defaultRateNote = rates?.effective_rate
    ? `Leave blank to use ${formatRate(rates.effective_rate)} (${rateSource}).`
    : "Leave blank to use the agency default."

  return (
    <>
      <form.Field name="reporting_rate">
        {(field) => (
          <AppField
            field={field}
            label="Reporting rate (optional)"
            type="number"
            placeholder={rates?.effective_rate ? formatRate(rates.effective_rate) : "e.g. 119.50"}
            disabled={isPending}
            description={`${defaultRateNote} This is only for reporting — it does not move any BDT.`}
          />
        )}
      </form.Field>

      <form.Subscribe selector={(state) => [state.values.amount_usd, state.values.reporting_rate] as const}>
        {([amount, rate]) => {
          const effective = Number(rate) || rates?.effective_rate || 0
          const preview = Number(amount) * effective
          if (!preview) return null
          return (
            <p className="rounded-lg bg-muted/60 px-3 py-2 text-sm text-muted-foreground">
              Recorded for reporting as{" "}
              <span className="font-medium text-foreground tabular-nums">{formatBdt(preview)}</span> at{" "}
              {formatRate(effective)}.
            </p>
          )
        }}
      </form.Subscribe>
    </>
  )
}

export default PaymentRateField
