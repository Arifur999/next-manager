"use client"

import { METRICS, PERIODS, type MetricSpec } from "@/components/modules/Admin/Targets/targetMetrics"
import AppField from "@/components/shared/form/AppField"
import AppSubmitButton from "@/components/shared/form/AppSubmitButton"
import EntitySelect from "@/components/shared/form/EntitySelect"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import type { KpiMetric, KpiPeriod } from "@/types/insights.types"
import type { IUser } from "@/types/user.types"
import { AGENCY_WIDE_TARGET, kpiTargetFormZodSchema, type IKpiTargetFormValues } from "@/zod/insights.validation"
import { useForm, useStore } from "@tanstack/react-form"

const defaultValues: IKpiTargetFormValues = {
  metric: "utilization_pct",
  period: "quarter",
  owner: AGENCY_WIDE_TARGET,
  target_value: "",
}

const TargetForm = ({
  users,
  onSubmit,
  isPending,
}: {
  users: IUser[]
  // Resolves true once the target is saved.
  onSubmit: (values: IKpiTargetFormValues) => Promise<boolean>
  isPending: boolean
}) => {
  const form = useForm({
    defaultValues,
    validators: { onSubmit: kpiTargetFormZodSchema },
    onSubmit: async ({ value, formApi }) => {
      // Only the value clears: the next target is often the same metric and
      // period for somebody else.
      if (await onSubmit(value)) {
        formApi.reset({ ...value, target_value: "" }, { keepDefaultValues: true })
      }
    },
  })

  const metric = useStore(form.store, (state) => state.values.metric)
  const isValueBlank = useStore(form.store, (state) => !state.values.target_value.trim())
  const spec = METRICS.find((entry) => entry.metric === metric) as MetricSpec

  return (
    <Card className="gap-0 p-0">
      <CardHeader className="border-b px-5 py-4">
        <CardTitle className="text-base">Set a target</CardTitle>
        <p className="text-sm text-muted-foreground">{spec.hint}</p>
      </CardHeader>

      <form
        method="POST"
        action="#"
        noValidate
        className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-5"
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          form.handleSubmit()
        }}
      >
        <form.Field name="metric">
          {(field) => (
            <EntitySelect
              id={field.name}
              label="Metric"
              value={field.state.value}
              onChange={(value) => field.handleChange(value as KpiMetric)}
              options={METRICS.map((entry) => ({ value: entry.metric, label: entry.label }))}
            />
          )}
        </form.Field>

        <form.Field name="period">
          {(field) => (
            <EntitySelect
              id={field.name}
              label="Period"
              value={field.state.value}
              onChange={(value) => field.handleChange(value as KpiPeriod)}
              options={PERIODS}
            />
          )}
        </form.Field>

        {/* An agency target is not the sum of the individual ones, so both can
            exist for the same metric and period. */}
        <form.Field name="owner">
          {(field) => (
            <EntitySelect
              id={field.name}
              label="Applies to"
              value={field.state.value}
              onChange={field.handleChange}
              options={[
                { value: AGENCY_WIDE_TARGET, label: "The whole agency" },
                ...users.map((user) => ({ value: user.id, label: user.full_name })),
              ]}
            />
          )}
        </form.Field>

        <form.Field name="target_value">
          {(field) => (
            <AppField
              field={field}
              label={spec.unit ? `Target (${spec.unit})` : "Target"}
              type="number"
              placeholder={spec.unit === "%" ? "70" : spec.unit === "×" ? "3" : "0"}
              disabled={isPending}
            />
          )}
        </form.Field>

        <div className="flex items-end">
          <AppSubmitButton isPending={isPending} pendingLabel="Saving..." disabled={isValueBlank}>
            Set target
          </AppSubmitButton>
        </div>
      </form>
    </Card>
  )
}

export default TargetForm
