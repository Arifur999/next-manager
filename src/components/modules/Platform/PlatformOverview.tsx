"use client"

import AttentionTile from "@/components/modules/Platform/AttentionTile"
import { companiesMatching } from "@/components/modules/Platform/companyLinks"
import LapsingList from "@/components/modules/Platform/LapsingList"
import StandingBadge from "@/components/modules/Platform/StandingBadge"
import TileLink from "@/components/modules/Platform/TileLink"
import MetricTile, { count, usd } from "@/components/shared/kpi/MetricTile"
import ErrorState from "@/components/shared/state/ErrorState"
import LoadingBlock from "@/components/shared/state/LoadingBlock"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { platformOverviewQuery } from "@/queries/platform.queries"
import { useQuery } from "@tanstack/react-query"
import { format, parseISO } from "date-fns"
import Link from "next/link"

/**
 * How the platform business is doing: the numbers that answer it, each opening
 * the list behind it, then what lapses this week and who signed up last.
 *
 * Nothing here is a company's own money; the API does not return it.
 */
const PlatformOverview = () => {
  const { data, isPending, isError, isFetching, refetch } = useQuery(platformOverviewQuery())

  const overview = data?.data

  if (isPending) return <LoadingBlock height="h-48" rounded />

  if (isError || !overview) {
    return (
      <ErrorState
        className="rounded-xl border border-dashed"
        message="The platform overview did not load."
        onRetry={() => void refetch()}
        isRetrying={isFetching}
      />
    )
  }

  const { companies, ending_soon: endingSoon, newest } = overview
  const paying = companies.active + companies.past_due

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <TileLink href="/platform/finance" label="Monthly revenue: open the financial report">
          <MetricTile
            label="Monthly revenue"
            metric={{ value: overview.mrr_usd }}
            format={usd}
            size="lead"
            tone={1}
            hint={`From ${paying} paying ${paying === 1 ? "company" : "companies"}, past due included.`}
          />
        </TileLink>

        <TileLink href="/platform/customers" label="Companies: open the companies list">
          <MetricTile
            label="Companies"
            metric={{ value: companies.total }}
            format={count}
            tone={3}
            hint={`${companies.trialing} on trial · ${companies.active} paying`}
          />
        </TileLink>

        <AttentionTile companies={companies} />
      </div>

      <LapsingList rows={endingSoon} />

      <Card className="gap-0 overflow-hidden p-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle className="text-base">Newest companies</CardTitle>
          <p className="text-sm text-muted-foreground">The five most recent to sign up.</p>
        </CardHeader>

        {newest.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-muted-foreground">Nobody has signed up yet.</p>
        ) : (
          <ul className="divide-y">
            {newest.map((row) => (
              <li key={row.id}>
                <Link
                  href={companiesMatching(row.name)}
                  className="flex items-center justify-between gap-3 px-5 py-3.5 outline-none hover:bg-muted/40 focus-visible:bg-muted/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{row.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {format(parseISO(row.created_at), "d MMM yyyy")} · {row.seats}{" "}
                      {row.seats === 1 ? "person" : "people"}
                      {row.plan && ` · ${row.plan}`}
                    </p>
                  </div>

                  <StandingBadge status={row.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

export default PlatformOverview
