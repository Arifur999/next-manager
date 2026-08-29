"use client"

import MetricTile, { count, usd } from "@/components/shared/kpi/MetricTile"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { getPlatformOverview } from "@/services/agencio.services"
import type { IPlatformOverview } from "@/types/platform.types"
import { useQuery } from "@tanstack/react-query"
import { differenceInCalendarDays, format, parseISO } from "date-fns"
import { CalendarClock } from "lucide-react"

/**
 * How the platform business is doing.
 *
 * The console listed companies and plans and nothing that answers "how are we
 * doing" — so this leads with the two numbers that do, and then with the one
 * list an operator acts on rather than reads: what lapses this week.
 *
 * Nothing here is a company's own money. The API does not return it, so this
 * screen could not show it if it tried.
 */

const daysLeft = (iso: string | null) =>
  iso === null ? null : differenceInCalendarDays(parseISO(iso), new Date())

const urgency = (days: number | null): "destructive" | "outline" =>
  days !== null && days <= 2 ? "destructive" : "outline"

const PlatformOverview = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["platform-overview"],
    queryFn: () => getPlatformOverview(),
  })

  const overview = data?.data as IPlatformOverview | undefined

  if (isLoading && !overview) {
    return <div className="h-48 animate-pulse rounded-xl bg-muted/40" />
  }

  if (!overview) return null

  const { companies, ending_soon: endingSoon, newest } = overview
  const paying = companies.active + companies.past_due

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <MetricTile
          label="Monthly revenue"
          metric={{ value: overview.mrr_usd }}
          format={usd}
          size="lead"
          tone={1}
          hint={`Across ${paying} paying ${paying === 1 ? "company" : "companies"}. Counts past due — money owed is still owed.`}
        />

        <MetricTile
          label="Companies"
          metric={{ value: companies.total }}
          format={count}
          tone={3}
          hint={`${companies.trialing} on trial · ${companies.active} active`}
        />

        <MetricTile
          label="Needs attention"
          metric={{ value: companies.past_due + companies.suspended + companies.unprovisioned }}
          format={count}
          tone={2}
          hint={
            // Spelled out rather than summarised: these three mean different
            // things and are fixed in different ways.
            `${companies.past_due} past due · ${companies.suspended} suspended · ${companies.unprovisioned} never set up`
          }
        />
      </div>

      <Card className="gap-0 overflow-hidden p-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle className="text-base">Lapsing within a week</CardTitle>
          <p className="text-sm text-muted-foreground">
            Trials ending and periods running out. This is the list to work through, not
            the one to read.
          </p>
        </CardHeader>

        {endingSoon.length === 0 ? (
          <p className="flex flex-col items-center gap-2 px-6 py-10 text-center text-sm text-muted-foreground">
            <CalendarClock className="size-7" aria-hidden="true" />
            Nothing lapses in the next seven days.
          </p>
        ) : (
          <ul className="divide-y">
            {endingSoon.map((row) => {
              const days = daysLeft(row.ends_at)

              return (
                <li
                  key={row.organization.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{row.organization.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {row.organization.email || "no contact email"} · {row.plan} ·{" "}
                      {row.status === "trialing" ? "trial" : "period"} ends{" "}
                      {row.ends_at ? format(parseISO(row.ends_at), "d MMM") : "—"}
                    </p>
                  </div>

                  <Badge variant={urgency(days)} className="shrink-0 tabular-nums">
                    {days === null
                      ? "no date"
                      : days <= 0
                        ? "today"
                        : `${days} ${days === 1 ? "day" : "days"}`}
                  </Badge>
                </li>
              )
            })}
          </ul>
        )}
      </Card>

      <Card className="gap-0 overflow-hidden p-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle className="text-base">Newest companies</CardTitle>
          <p className="text-sm text-muted-foreground">The five most recent to sign up.</p>
        </CardHeader>

        {newest.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-muted-foreground">
            Nobody has signed up yet.
          </p>
        ) : (
          <ul className="divide-y">
            {newest.map((row) => (
              <li key={row.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{row.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {format(parseISO(row.created_at), "d MMM yyyy")} · {row.seats}{" "}
                    {row.seats === 1 ? "person" : "people"}
                  </p>
                </div>

                <Badge variant={row.status ? "secondary" : "outline"} className="shrink-0">
                  {row.plan ?? "not set up"}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

export default PlatformOverview
