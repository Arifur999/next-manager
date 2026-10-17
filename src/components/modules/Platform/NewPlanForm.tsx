"use client"

import { createPlanAction } from "@/app/(dashboardLayout)/platform/_action"
import AppField from "@/components/shared/form/AppField"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { useActionMutation } from "@/hooks/useActionMutation"
import { queryKeys } from "@/lib/queryKeys"
import { planFormZodSchema, type IPlanFormValues } from "@/zod/platform.validation"
import { useForm } from "@tanstack/react-form"

const newPlanDefaults: IPlanFormValues = { code: "", name: "", price_usd: "" }

// The code is used in checks and refusal messages, so it is set here once and never changes.
const NewPlanForm = () => {
  const { run: createPlan, isPending } = useActionMutation({
    action: createPlanAction,
    successMessage: "Plan created",
    invalidateKeys: [queryKeys.platformPlans.all],
    refresh: false,
  })

  const form = useForm({
    defaultValues: newPlanDefaults,
    onSubmit: async ({ value, formApi }) => {
      if (await createPlan(value)) formApi.reset()
    },
  })

  return (
    <Card className="gap-0 p-0">
      <CardHeader className="border-b px-5 py-4">
        <CardTitle className="text-base">New plan</CardTitle>
        <p className="text-sm text-muted-foreground">
          The code never changes once set. Limits, features and the pricing page are set on the plan below.
        </p>
      </CardHeader>

      <form
        className="flex flex-wrap items-start gap-3 p-5"
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          void form.handleSubmit()
        }}
      >
        <form.Field name="code" validators={{ onChange: planFormZodSchema.shape.code }}>
          {(field) => (
            <AppField
              field={field}
              label="Code"
              placeholder="e.g. agency_pro"
              autoComplete="off"
              className="w-40 font-mono"
              disabled={isPending}
            />
          )}
        </form.Field>

        <form.Field name="name" validators={{ onChange: planFormZodSchema.shape.name }}>
          {(field) => (
            <AppField
              field={field}
              label="Name"
              placeholder="e.g. Agency Pro"
              autoComplete="off"
              className="w-44"
              disabled={isPending}
            />
          )}
        </form.Field>

        <form.Field name="price_usd" validators={{ onChange: planFormZodSchema.shape.price_usd }}>
          {(field) => (
            <AppField
              field={field}
              label="$ / month"
              type="number"
              placeholder="0"
              className="w-28 tabular-nums"
              disabled={isPending}
            />
          )}
        </form.Field>

        {/* Lined up with the inputs, under the labels, rather than with any error below them. */}
        <Button type="submit" className="mt-6" disabled={isPending}>
          {isPending ? "Creating..." : "Create plan"}
        </Button>
      </form>
    </Card>
  )
}

export default NewPlanForm
