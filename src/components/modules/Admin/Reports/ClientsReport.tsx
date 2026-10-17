"use client"

import ShareRow from "@/components/modules/Admin/Reports/ShareRow"
import ReportEmpty from "@/components/modules/Admin/Reports/ReportEmpty"
import PanelState from "@/components/shared/state/PanelState"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { formatBdt, formatUsd } from "@/lib/currency"
import { plural } from "@/lib/text"
import { useQuery } from "@tanstack/react-query"
import { clientRevenueQuery } from "@/queries/insights.queries"

/**
 * Who actually pays.
 *
 * Money received, not money invoiced. An unpaid invoice is a hope, and a client
 * ranked by what they were billed rather than what they sent would put your
 * worst payer at the top of the list.
 */

// `period` is the page's from/to, so the ranking covers the days it names.
const ClientsReport = ({ period }: { period: string }) => {
  const revenueQuery = useQuery(clientRevenueQuery(period))

  const clients = revenueQuery.data?.data ?? []
  const top = clients[0]?.revenue_usd ?? 1

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <CardHeader className="border-b px-5 py-4">
        <CardTitle className="text-base">Revenue by client</CardTitle>
        <p className="text-sm text-muted-foreground">
          Money received, highest first. The BDT figure is at the rate recorded on each
          payment, not today&apos;s.
        </p>
      </CardHeader>

      <PanelState
        query={revenueQuery}
        errorMessage="Revenue by client did not load."
        isEmpty={clients.length === 0}
        empty={<ReportEmpty>No payments recorded yet.</ReportEmpty>}
      >
        <ul className="divide-y">
          {clients.map((row) => (
            <ShareRow
              key={row.client?.id ?? "unknown"}
              label={row.client?.name ?? "Unknown client"}
              sub={`${plural(row.payment_count, "payment")} · ${formatBdt(row.revenue_bdt_reporting)} at recorded rates`}
              value={formatUsd(row.revenue_usd)}
              share={(row.revenue_usd / top) * 100}
            />
          ))}
        </ul>
      </PanelState>
    </Card>
  )
}

export default ClientsReport
