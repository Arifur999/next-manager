"use client"

import { createPlanAction, updatePlanAction } from "@/app/(dashboardLayout)/platform/_action"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getPlans } from "@/services/agencio.services"
import type { IPlan } from "@/types/platform.types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"

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

const PlanRow = ({ plan }: { plan: IPlan }) => {
  const queryClient = useQueryClient()
  const [price, setPrice] = useState(String(plan.price_usd))
  const [seats, setSeats] = useState(plan.max_seats === null ? "" : String(plan.max_seats))
  const [projects, setProjects] = useState(
    plan.max_projects === null ? "" : String(plan.max_projects),
  )

  const { mutate: save, isPending } = useMutation({
    mutationFn: () =>
      updatePlanAction(plan.id, {
        price_usd: Number(price),
        // An empty box is unlimited, which the API expects as null. Sending 0
        // would create a plan nobody could use, and it refuses that anyway.
        max_seats: seats.trim() === "" ? null : Number(seats),
        max_projects: projects.trim() === "" ? null : Number(projects),
      }),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message || "Could not update the plan")
        return
      }
      toast.success(`${plan.name} updated`)
      void queryClient.invalidateQueries({ queryKey: ["platform-plans"] })
      // Company rows show their plan's limits, so they are stale now too.
      void queryClient.invalidateQueries({ queryKey: ["platform-companies"] })
    },
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

        <Button type="button" size="sm" disabled={isPending || !dirty} onClick={() => save()}>
          Save
        </Button>
      </div>
    </li>
  )
}

const PlansBoard = () => {
  const queryClient = useQueryClient()
  const [code, setCode] = useState("")
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["platform-plans"],
    queryFn: () => getPlans(),
  })

  const plans = (data?.data ?? []) as IPlan[]

  const { mutate: create, isPending } = useMutation({
    mutationFn: () =>
      createPlanAction({
        code: code.trim().toLowerCase(),
        name: name.trim(),
        price_usd: price.trim() === "" ? 0 : Number(price),
      }),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message || "Could not create the plan")
        return
      }
      toast.success("Plan created")
      setCode("")
      setName("")
      setPrice("")
      void queryClient.invalidateQueries({ queryKey: ["platform-plans"] })
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
          onSubmit={(event) => {
            event.preventDefault()
            if (!code.trim() || !name.trim()) return
            create()
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="plan-code">Code</Label>
            <Input
              id="plan-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="agency_pro"
              className="w-40 font-mono"
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="plan-name">Name</Label>
            <Input
              id="plan-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Agency Pro"
              className="w-44"
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="plan-price">$ / month</Label>
            <Input
              id="plan-price"
              type="number"
              step="any"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="0"
              className="w-28 tabular-nums"
              disabled={isPending}
            />
          </div>

          <Button type="submit" disabled={isPending || !code.trim() || !name.trim()}>
            Create plan
          </Button>
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
