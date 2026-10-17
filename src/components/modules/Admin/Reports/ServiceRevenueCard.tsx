"use client"

import ReportEmpty from "@/components/modules/Admin/Reports/ReportEmpty"
import ShareRow from "@/components/modules/Admin/Reports/ShareRow"
import PanelState from "@/components/shared/state/PanelState"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { formatUsd } from "@/lib/currency"
import { plural } from "@/lib/text"
import { serviceRevenueQuery } from "@/queries/catalog.queries"
import { useQuery } from "@tanstack/react-query"

/**
 * What each service has been billed, the figure the service pages leave out
 * on purpose. Lines on invoices that went out, not money received; lines typed
 * by hand get their own row so the total still matches the invoices.
 */
const ServiceRevenueCard = ({ hasPeriod }: { hasPeriod: boolean }) => {
  const revenueQuery = useQuery(serviceRevenueQuery())
  const rows = revenueQuery.data?.data ?? []
  const top = Math.max(...rows.map((row) => row.billed_usd), 1)

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <CardHeader className="border-b px-5 py-4">
        <CardTitle className="text-base">Revenue by service</CardTitle>
        <p className="text-sm text-muted-foreground">
          Billed on invoices that went out, highest first.
          {/* GET /services/revenue sums every invoice, so the card says so rather than look filtered. */}
          {hasPeriod && " All time: this card does not follow the period above."}
        </p>
      </CardHeader>

      <PanelState
        query={revenueQuery}
        errorMessage="Revenue by service did not load."
        isEmpty={rows.length === 0}
        empty={<ReportEmpty>No invoice lines billed yet.</ReportEmpty>}
      >
        <ul className="divide-y">
          {rows.map((row) => (
            <ShareRow
              key={row.service.id || "typed-by-hand"}
              label={row.service.name || "Removed service"}
              sub={plural(row.line_count, "invoice line")}
              value={formatUsd(row.billed_usd)}
              share={(row.billed_usd / top) * 100}
            />
          ))}
        </ul>
      </PanelState>
    </Card>
  )
}

export default ServiceRevenueCard
