"use client"

import EmptyState from "@/components/shared/state/EmptyState"
import PanelState from "@/components/shared/state/PanelState"
import { Card } from "@/components/ui/card"
import { formatBdt, formatUsd } from "@/lib/currency"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { Wallet } from "lucide-react"
import { paymentsListQuery } from "@/queries/billing.queries"

// The payments endpoint filters by search text rather than client id, so the
// list is narrowed here.
const ClientPaymentsPanel = ({ clientId }: { clientId: string }) => {
  const paymentsQuery = useQuery(paymentsListQuery())

  const payments = (paymentsQuery.data?.data ?? []).filter((payment) => payment.client_id === clientId)

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <PanelState
        query={paymentsQuery}
        errorMessage="The payments did not load."
        isEmpty={payments.length === 0}
        empty={<EmptyState icon={Wallet}>Nothing received from this client yet.</EmptyState>}
      >
        <ul className="divide-y">
          {payments.map((payment) => (
            <li key={payment.id} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="min-w-0">
                <p className="text-sm tabular-nums">{formatUsd(payment.amount_usd)}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {format(new Date(payment.date), "MMM dd, yyyy")}
                  {payment.reference ? ` · ${payment.reference}` : ""}
                </p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                {formatBdt(payment.amount_bdt_reporting)}
              </span>
            </li>
          ))}
        </ul>
      </PanelState>
    </Card>
  )
}

export default ClientPaymentsPanel
