"use client"

import { createPlanAction, updatePlanAction } from "@/app/(dashboardLayout)/platform/_action"
import AppField from "@/components/shared/form/AppField"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useActionMutation } from "@/hooks/useActionMutation"
import type { IPlan } from "@/types/platform.types"
import {
  planFormZodSchema,
  type IPlanFormValues,
  type IPlanLimitsFormValues,
} from "@/zod/platform.validation"
import { useForm } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { plansQuery } from "@/queries/platform.queries"
import { queryKeys } from "@/lib/queryKeys"

/**
 * The tiers a company can be sold.
 *
 * Limits live on the plan, so raising what Starter includes lifts every company
 * on Starter at once. A company that negotiated something different gets its
 * own plan row rather than an override that would silently diverge from the
 * tier it claims to be on.
 *
 * Empty means unlimited throughout. Not zero — a plan nobody can add anybody to
 * is not a plan, and the server refuses one.
 */

const limitLabel = (value: number | null) => (value === null ? "unlimited" : String(value))

const newPlanDefaults: IPlanFormValues = { code: "", name: "", price_usd: "" }

const PlanRow = ({ plan }: { plan: IPlan }) => {
  const [price, setPrice] = useState(String(plan.price_usd))
  const [seats, setSeats] = useState(plan.max_seats === null ? "" : String(plan.max_seats))
  const [projects, setProjects] = useState(
    plan.max_projects === null ? "" : String(plan.max_projects),
  )

  const { run: savePlan, isPending } = useActionMutation({
    action: (values: IPlanLimitsFormValues) => updatePlanAction(plan.id, values),
    successMessage: `${plan.name} updated`,
    // Company rows show their plan's limits, so they are stale now too.
    invalidateKeys: [queryKeys.platformPlans.all, queryKeys.platformCompanies.all],
    refresh: false,
  })

  const dirty =
    Number(price) !== plan.price_usd ||
    (seats.trim() === "" ? plan.max_seats !== null : Number(seats) !== plan.max_seats) ||
    (projects.trim() === ""
      ? plan.max_projects !== null
      : Number(projects) !== plan.max_projects)

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
      <div className="min-w-40 flex-1">
        <p className="text-sm font-medium">
          {plan.name}
          <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">
            {plan.code}
          </span>
          {!plan.is_active && (
            <Badge variant="outline" className="ml-2 text-[10px]">
              retired
            </Badge>
          )}
        </p>
        <p className="text-xs text-muted-foreground">
          {limitLabel(plan.max_seats)} seats · {limitLabel(plan.max_projects)} projects
          {plan.features.length > 0 ? ` · ${plan.features.join(", ")}` : ""}
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="sr-only sm:not-sr-only">$/mo</span>
          <Input
            type="number"
            step="any"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            className="w-24 tabular-nums"
            disabled={isPending}
            aria-label={`Price for ${plan.name}`}
          />
        </label>

        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="sr-only sm:not-sr-only">Seats</span>
          <Input
            type="number"
            value={seats}
            onChange={(event) => setSeats(event.target.value)}
            placeholder="∞"
            className="w-20 tabular-nums"
            disabled={isPending}
            aria-label={`Seat limit for ${plan.name}`}
          />
        </label>

        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="sr-only sm:not-sr-only">Projects</span>
          <Input
            type="number"
            value={projects}
            onChange={(event) => setProjects(event.target.value)}
            placeholder="∞"
            className="w-20 tabular-nums"
            disabled={isPending}
            aria-label={`Project limit for ${plan.name}`}
          />
        </label>

        <Button
          type="button"
          size="sm"
          disabled={isPending || !dirty}
          onClick={() => void savePlan({ price_usd: price, max_seats: seats, max_projects: projects })}
        >
          Save
        </Button>
      </div>
    </li>
  )
}

const PlansBoard = () => {
  const { data, isLoading } = useQuery(plansQuery())

  const plans = data?.data ?? []

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
    <div className="space-y-6">
      <Card className="gap-0 p-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle className="text-base">New plan</CardTitle>
          <p className="text-sm text-muted-foreground">
            The code is used in checks and refusal messages, so it is set once and never
            changes. Limits are set on the row after it exists.
          </p>
        </CardHeader>

        <form
          className="flex flex-wrap items-end gap-3 p-5"
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
                placeholder="agency_pro"
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
                placeholder="Agency Pro"
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

          <form.Subscribe
            selector={(state) => state.values.code.trim() !== "" && state.values.name.trim() !== ""}
          >
            {(isFilledIn) => (
              <Button type="submit" disabled={isPending || !isFilledIn}>
                Create plan
              </Button>
            )}
          </form.Subscribe>
        </form>
      </Card>

      <Card className="gap-0 overflow-hidden p-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle className="text-base">Plans</CardTitle>
          <p className="text-sm text-muted-foreground">
            Leave a limit empty for unlimited. Changing a limit moves every company on
            that plan at once.
          </p>
        </CardHeader>

        {isLoading && plans.length === 0 ? (
          <div className="h-32 animate-pulse bg-muted/40" />
        ) : (
          <ul className="divide-y">
            {plans.map((plan) => (
              <PlanRow key={plan.id} plan={plan} />
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

export default PlansBoard
