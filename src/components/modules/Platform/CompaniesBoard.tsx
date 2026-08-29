"use client"

import { setSubscriptionAction } from "@/app/(dashboardLayout)/platform/_action"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getCompanies, getPlans } from "@/services/agencio.services"
import type { ICompanyRow, IPlan, SubscriptionStatus } from "@/types/platform.types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format, parseISO } from "date-fns"
import { Building2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

/**
 * Every company on the platform, and what it is paying.
 *
 * What is deliberately absent is the point: no balances, no payments, no client
 * names, no vault. Provisioning a workspace is not a licence to read the books
 * of the business inside it, and the API does not return those columns at all —
 * this screen could not show them if it tried.
 *
 * Usage is shown as used-of-limit rather than a percentage. "4 of 5 seats" says
 * what to do next; "80%" does not.
 */

const STATUS_LABEL: Record<SubscriptionStatus, string> = {
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

const STATUSES: SubscriptionStatus[] = [
  "trialing",
  "active",
  "past_due",
  "suspended",
  "cancelled",
]

const UsageCell = ({ used, limit }: { used: number; limit: number | null }) => (
  <span className="tabular-nums">
    {used}
    {/* Null is unlimited, and saying so is better than an em-dash the reader
        has to interpret. */}
    <span className="text-muted-foreground"> / {limit === null ? "∞" : limit}</span>
  </span>
)

const CompanyRow = ({ company, plans }: { company: ICompanyRow; plans: IPlan[] }) => {
  const queryClient = useQueryClient()
  const [planId, setPlanId] = useState(company.subscription?.plan_id ?? "")
  const [status, setStatus] = useState<SubscriptionStatus>(
    company.subscription?.status ?? "trialing",
  )

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => setSubscriptionAction(company.id, { plan_id: planId, status }),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message || "Could not update the subscription")
        return
      }
      toast.success(`${company.name} updated`)
      void queryClient.invalidateQueries({ queryKey: ["platform-companies"] })
    },
  })

  const dirty =
    planId !== (company.subscription?.plan_id ?? "") ||
    status !== (company.subscription?.status ?? "trialing")

  return (
    <tr>
      <td className="px-5 py-3">
        <p className="font-medium">{company.name}</p>
        <p className="text-xs text-muted-foreground">
          {company.email || "no contact email"} · joined{" "}
          {format(parseISO(company.created_at), "dd MMM yyyy")}
        </p>
      </td>

      <td className="px-5 py-3 text-right">
        <UsageCell used={company.usage.seats_used} limit={company.usage.seats_limit} />
      </td>

      <td className="px-5 py-3 text-right">
        <UsageCell used={company.usage.projects_used} limit={company.usage.projects_limit} />
      </td>

      <td className="px-5 py-3">
        {company.subscription ? (
          <Badge variant={STATUS_TONE[company.subscription.status]}>
            {STATUS_LABEL[company.subscription.status]}
          </Badge>
        ) : (
          <Badge variant="outline">not set up</Badge>
        )}
      </td>

      <td className="px-5 py-3">
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

          <Select value={status} onValueChange={(next) => setStatus(next as SubscriptionStatus)}>
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
            disabled={isPending || !dirty || !planId}
            onClick={() => save()}
          >
            Save
          </Button>
        </div>
      </td>
    </tr>
  )
}

const CompaniesBoard = () => {
  const { data: companiesData, isLoading } = useQuery({
    queryKey: ["platform-companies"],
    queryFn: () => getCompanies(),
  })

  const { data: plansData } = useQuery({
    queryKey: ["platform-plans"],
    queryFn: () => getPlans(),
  })

  const companies = (companiesData?.data ?? []) as ICompanyRow[]
  const plans = (plansData?.data ?? []) as IPlan[]

  const atLimit = companies.filter(
    (company) =>
      (company.usage.seats_limit !== null &&
        company.usage.seats_used >= company.usage.seats_limit) ||
      (company.usage.projects_limit !== null &&
        company.usage.projects_used >= company.usage.projects_limit),
  ).length

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <CardHeader className="border-b px-5 py-4">
        <CardTitle className="text-base">Companies</CardTitle>
        <p className="text-sm text-muted-foreground">
          {companies.length === 0
            ? "No companies yet."
            : atLimit === 0
              ? `${companies.length} on the platform, none at a plan limit.`
              : /* The ones about to hit a wall are the ones worth a call, so
                   they are counted rather than left to be spotted by eye. */
                `${companies.length} on the platform · ${atLimit} at a plan limit`}
        </p>
      </CardHeader>

      {isLoading && companies.length === 0 ? (
        <div className="h-40 animate-pulse bg-muted/40" />
      ) : companies.length === 0 ? (
        <p className="flex flex-col items-center gap-2 px-6 py-12 text-center text-sm text-muted-foreground">
          <Building2 className="size-7" aria-hidden="true" />
          Nobody has signed up yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[56rem] text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="px-5 py-2.5 font-medium">Company</th>
                <th className="px-5 py-2.5 text-right font-medium">Seats</th>
                <th className="px-5 py-2.5 text-right font-medium">Projects</th>
                <th className="px-5 py-2.5 font-medium">Standing</th>
                <th className="px-5 py-2.5 text-right font-medium">Plan</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {companies.map((company) => (
                <CompanyRow key={company.id} company={company} plans={plans} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

export default CompaniesBoard
