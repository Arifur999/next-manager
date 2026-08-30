"use client"

import ShareRow from "@/components/modules/Admin/Reports/ShareRow"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { formatBdt, formatUsd } from "@/lib/currency"
import { getClientRevenue } from "@/services/agencio.services"
import { useQuery } from "@tanstack/react-query"

/**
 * Who actually pays.
 *
 * Money received, not money invoiced. An unpaid invoice is a hope, and a client
 * ranked by what they were billed rather than what they sent would put your
 * worst payer at the top of the list.
 */

type ClientRevenueRow = {
  client: { id: string; name: string; company: string } | null
  revenue_usd: number
  revenue_bdt_reporting: number
  payment_count: number
}

const ClientsReport = () => {
  const { data } = useQuery({
    queryKey: ["report-client-revenue"],
    queryFn: () => getClientRevenue(),
  })

  const clients = (data?.data ?? []) as ClientRevenueRow[]
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

      {clients.length === 0 ? (
        <p className="px-5 py-12 text-center text-sm text-muted-foreground">
          No payments recorded yet.
        </p>
      ) : (
        <ul className="divide-y">
          {clients.map((row) => (
            <ShareRow
              key={row.client?.id ?? "unknown"}
              label={row.client?.name ?? "Unknown client"}
              sub={`${row.payment_count} payment${row.payment_count === 1 ? "" : "s"} · ${formatBdt(row.revenue_bdt_reporting)} at recorded rates`}
              value={formatUsd(row.revenue_usd)}
              share={(row.revenue_usd / top) * 100}
            />
          ))}
        </ul>
      )}
    </Card>
  )
}

export default ClientsReport
