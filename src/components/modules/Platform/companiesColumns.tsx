"use client"

import { setSubscriptionAction } from "@/app/(dashboardLayout)/platform/_action"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useActionMutation } from "@/hooks/useActionMutation"
import { toDate } from "@/lib/dates"
import { queryKeys } from "@/lib/queryKeys"
import type { ICompanyRow, IPlan, SubscriptionStatus } from "@/types/platform.types"
import type { ISubscriptionFormValues } from "@/zod/platform.validation"
import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { useState } from "react"

export const STATUS_LABEL: Record<SubscriptionStatus, string> = {
  trialing: "trial",
  active: "active",
  past_due: "past due",
  suspended: "suspended",
  cancelled: "cancelled",
}

// past_due is the grace window — still writing — so it reads as a warning, not
// a failure. Suspended and cancelled are the ones that actually block.
const STATUS_TONE: Record<SubscriptionStatus, "secondary" | "outline" | "destructive"> = {
  trialing: "outline",
  active: "secondary",
  past_due: "outline",
  suspended: "destructive",
  cancelled: "destructive",
}

export const STATUSES: SubscriptionStatus[] = ["trialing", "active", "past_due", "suspended", "cancelled"]

// The filter's value for a company with no subscription row at all.
export const NOT_SET_UP = "none"

const UsageCell = ({ used, limit }: { used: number; limit: number | null }) => (
  <span className="tabular-nums">
    {used}
    {/* Null is unlimited, and saying so is better than an em-dash the reader
        has to interpret. */}
    <span className="text-muted-foreground"> / {limit === null ? "∞" : limit}</span>
  </span>
)

const usageText = (used: number, limit: number | null) => `${used} of ${limit ?? "unlimited"}`

// One company's plan and standing, saved together. The choice lives here until
// Save; paging away from the row drops an unsaved one.
const SubscriptionEditor = ({ company, plans }: { company: ICompanyRow; plans: IPlan[] }) => {
  const [planId, setPlanId] = useState(company.subscription?.plan_id ?? "")
  const [status, setStatus] = useState<SubscriptionStatus>(company.subscription?.status ?? "trialing")

  const { run: saveSubscription, isPending } = useActionMutation({
    action: (values: ISubscriptionFormValues) => setSubscriptionAction(company.id, values),
    successMessage: `${company.name} updated`,
    invalidateKeys: [queryKeys.platformCompanies.all],
    refresh: false,
  })

  const isDirty =
    planId !== (company.subscription?.plan_id ?? "") || status !== (company.subscription?.status ?? "trialing")

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Select value={planId} onValueChange={setPlanId}>
        <SelectTrigger className="w-36" aria-label={`Plan for ${company.name}`}>
          <SelectValue placeholder="Choose a plan" />
        </SelectTrigger>
        <SelectContent>
          {plans.map((plan) => (
            <SelectItem key={plan.id} value={plan.id}>
              {plan.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={status}
        onValueChange={(next) => {
          const picked = STATUSES.find((option) => option === next)
          if (picked) setStatus(picked)
        }}
      >
        <SelectTrigger className="w-32" aria-label={`Status for ${company.name}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((option) => (
            <SelectItem key={option} value={option}>
              {STATUS_LABEL[option]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        type="button"
        size="sm"
        disabled={isPending || !isDirty || !planId}
        onClick={() => void saveSubscription({ plan_id: planId, status })}
      >
        Save
      </Button>
    </div>
  )
}

const planName = (company: ICompanyRow, plans: IPlan[]) =>
  plans.find((plan) => plan.id === company.subscription?.plan_id)?.name ?? ""

export const companiesColumns = (plans: IPlan[]): ColumnDef<ICompanyRow>[] => [
  {
    id: "company",
    accessorFn: (company) => `${company.name} ${company.email}`,
    header: "Company",
    sortingFn: (a, b) => a.original.name.localeCompare(b.original.name),
    meta: {
      exportValue: (company) => (company.email ? `${company.name} (${company.email})` : company.name),
    },
    cell: ({ row }) => (
      <>
        <p className="font-medium">{row.original.name}</p>
        <p className="text-xs text-muted-foreground">
          {row.original.email || "no contact email"} · joined {format(toDate(row.original.created_at), "dd MMM yyyy")}
        </p>
      </>
    ),
  },
  {
    id: "seats",
    accessorFn: (company) => company.usage.seats_used,
    header: "Seats",
    meta: { exportValue: (company) => usageText(company.usage.seats_used, company.usage.seats_limit) },
    cell: ({ row }) => <UsageCell used={row.original.usage.seats_used} limit={row.original.usage.seats_limit} />,
  },
  {
    id: "projects",
    accessorFn: (company) => company.usage.projects_used,
    header: "Projects",
    meta: { exportValue: (company) => usageText(company.usage.projects_used, company.usage.projects_limit) },
    cell: ({ row }) => (
      <UsageCell used={row.original.usage.projects_used} limit={row.original.usage.projects_limit} />
    ),
  },
  {
    id: "standing",
    accessorFn: (company) => company.subscription?.status ?? NOT_SET_UP,
    header: "Standing",
    enableSorting: false,
    meta: {
      exportValue: (company) => (company.subscription ? STATUS_LABEL[company.subscription.status] : "not set up"),
    },
    cell: ({ row }) => {
      const subscription = row.original.subscription
      if (!subscription) return <Badge variant="outline">not set up</Badge>
      return <Badge variant={STATUS_TONE[subscription.status]}>{STATUS_LABEL[subscription.status]}</Badge>
    },
  },
  {
    id: "plan",
    accessorFn: (company) => planName(company, plans),
    header: "Plan",
    enableSorting: false,
    // Keyed by company: rows are matched by position, and an editor holding
    // one company's unsaved choice must never be handed another company.
    cell: ({ row }) => <SubscriptionEditor key={row.original.id} company={row.original} plans={plans} />,
  },
]
