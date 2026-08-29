"use client"

import CreateCompanyModal from "@/components/modules/Platform/CreateCompanyModal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getCompanies } from "@/services/agencio.services"
import type { ICompanyRow, SubscriptionStatus } from "@/types/platform.types"
import { useQuery } from "@tanstack/react-query"
import { differenceInCalendarDays, format, formatDistanceToNow, parseISO } from "date-fns"
import { Building2, Search } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

/**
 * The people you sell to.
 *
 * One row per customer: the company, the person it was sold to, what they pay
 * and whether they are still using it. Not a list of every customer's staff —
 * that would put thousands of other people's names on one screen and answer no
 * question running a platform actually asks.
 *
 * The same board serves "All" and "Active"; they differ only by which filter
 * arrives. Two screens would have been two places to fix the same bug.
 */

const ALL = "__all__"

const STATUS_LABEL: Record<SubscriptionStatus, string> = {
  trialing: "trial",
  active: "active",
  past_due: "past due",
  suspended: "suspended",
  cancelled: "cancelled",
}

const STATUS_TONE: Record<SubscriptionStatus, "secondary" | "outline" | "destructive"> = {
  trialing: "outline",
  active: "secondary",
  // The grace window — still writing, so not a failure yet.
  past_due: "outline",
  suspended: "destructive",
  cancelled: "destructive",
}

const FILTERS: Array<{ value: string; label: string }> = [
  { value: ALL, label: "Everyone" },
  { value: "trialing", label: "On trial" },
  { value: "active", label: "Paying" },
  { value: "past_due", label: "Past due" },
  { value: "suspended", label: "Suspended" },
  { value: "cancelled", label: "Left" },
]

/**
 * How long since they did anything.
 *
 * Silence is the earliest churn signal there is — it arrives weeks before a
 * cancellation does — so a company quiet for a month is marked rather than
 * left for somebody to notice by reading dates.
 */
const activityOf = (iso: string | null) => {
  if (!iso) return { text: "never used", stale: true }

  const days = differenceInCalendarDays(new Date(), parseISO(iso))
  return {
    text: formatDistanceToNow(parseISO(iso), { addSuffix: true }),
    stale: days >= 30,
  }
}

const CustomersBoard = ({ defaultFilter = ALL }: { defaultFilter?: string }) => {
  const [filter, setFilter] = useState(defaultFilter)
  const [search, setSearch] = useState("")

  const query = [
    filter === ALL ? "" : `status=${filter}`,
    search.trim() ? `search=${encodeURIComponent(search.trim())}` : "",
  ]
    .filter(Boolean)
    .join("&")

  const { data, isLoading } = useQuery({
    queryKey: ["platform-companies", query],
    queryFn: () => getCompanies(query),
  })

  const companies = (data?.data ?? []) as ICompanyRow[]
  const quiet = companies.filter((row) => activityOf(row.last_active_at).stale).length

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <CardHeader className="space-y-3 border-b px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">Customers</CardTitle>
            <p className="text-sm text-muted-foreground">
              {companies.length} {companies.length === 1 ? "company" : "companies"}
              {quiet > 0 && (
                <>
                  {" · "}
                  <span className="text-foreground">
                    {quiet} quiet for a month or more
                  </span>
                </>
              )}
            </p>
          </div>

          <CreateCompanyModal />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((option) => (
            <Button
              key={option.value}
              type="button"
              size="sm"
              variant={option.value === filter ? "default" : "outline"}
              onClick={() => setFilter(option.value)}
              aria-pressed={option.value === filter}
            >
              {option.label}
            </Button>
          ))}

          <div className="relative ml-auto min-w-52">
            <Search
              className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Company or the person you sold to"
              className="pl-8"
              aria-label="Search customers"
            />
          </div>
        </div>
      </CardHeader>

      {isLoading && companies.length === 0 ? (
        <div className="h-40 animate-pulse bg-muted/40" />
      ) : companies.length === 0 ? (
        <p className="flex flex-col items-center gap-2 px-6 py-12 text-center text-sm text-muted-foreground">
          <Building2 className="size-7" aria-hidden="true" />
          {search.trim() || filter !== ALL
            ? "Nothing matches that."
            : "Nobody has signed up yet."}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[58rem] text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="px-5 py-2.5 font-medium">Company</th>
                <th className="px-5 py-2.5 font-medium">Who you sold to</th>
                <th className="px-5 py-2.5 font-medium">Plan</th>
                <th className="px-5 py-2.5 text-right font-medium">Seats</th>
                <th className="px-5 py-2.5 font-medium">Last used</th>
                <th className="px-5 py-2.5 font-medium">Standing</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {companies.map((company) => {
                const activity = activityOf(company.last_active_at)
                const seatsFull =
                  company.usage.seats_limit !== null &&
                  company.usage.seats_used >= company.usage.seats_limit

                return (
                  <tr key={company.id}>
                    <td className="px-5 py-3">
                      <p className="font-medium">{company.name}</p>
                      <p className="text-xs text-muted-foreground">
                        signed up {format(parseISO(company.created_at), "d MMM yyyy")}
                      </p>
                    </td>

                    <td className="px-5 py-3">
                      {company.admin ? (
                        <>
                          <p>{company.admin.full_name}</p>
                          <a
                            href={`mailto:${company.admin.email}`}
                            className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                          >
                            {company.admin.email}
                          </a>
                        </>
                      ) : (
                        // Real, and worth seeing: a company whose admin was
                        // removed has nobody who can let anyone back in.
                        <span className="text-xs text-muted-foreground">no admin account</span>
                      )}
                    </td>

                    <td className="px-5 py-3">
                      {company.subscription ? (
                        <>
                          <p>{company.subscription.plan.name}</p>
                          <p className="text-xs text-muted-foreground tabular-nums">
                            ${company.subscription.plan.price_usd}/mo
                          </p>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">not set up</span>
                      )}
                    </td>

                    <td className="px-5 py-3 text-right">
                      <span className="tabular-nums">
                        {company.usage.seats_used}
                        <span className="text-muted-foreground">
                          {" / "}
                          {company.usage.seats_limit === null ? "∞" : company.usage.seats_limit}
                        </span>
                      </span>
                      {seatsFull && (
                        <Badge variant="outline" className="ml-2 text-[10px]">
                          full
                        </Badge>
                      )}
                    </td>

                    <td className="px-5 py-3">
                      <span
                        className={activity.stale ? "text-foreground" : "text-muted-foreground"}
                      >
                        {activity.text}
                      </span>
                      {activity.stale && (
                        <span className="ml-2 text-[10px] uppercase tracking-wide text-muted-foreground">
                          quiet
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3">
                      {company.subscription ? (
                        <Badge variant={STATUS_TONE[company.subscription.status]}>
                          {STATUS_LABEL[company.subscription.status]}
                        </Badge>
                      ) : (
                        <Badge variant="outline">unprovisioned</Badge>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="border-t px-5 py-3 text-xs text-muted-foreground">
        Changing a plan or suspending a customer happens on{" "}
        <Link href="/platform/plans" className="text-primary underline-offset-4 hover:underline">
          the plans screen
        </Link>
        .
      </div>
    </Card>
  )
}

export default CustomersBoard
