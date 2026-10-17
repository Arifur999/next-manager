"use client"

import RecordPayoutModal from "@/components/modules/Admin/Payouts/RecordPayoutModal"
import { payoutsColumns } from "@/components/modules/Admin/Payouts/payoutsColumns"
import StatTile from "@/components/shared/StatTile"
import DataTable from "@/components/shared/table/DataTable"
import { formatBdt } from "@/lib/currency"
import { toTableQueryProps } from "@/lib/table/queryProps"
import { useQuery } from "@tanstack/react-query"
import { HandCoins } from "lucide-react"
import { teamPayoutsListQuery } from "@/queries/spending.queries"

const PayoutsTable = () => {
  const payoutsQuery = useQuery(teamPayoutsListQuery())

  const payouts = payoutsQuery.data?.data ?? []
  const total = payouts.reduce((running, row) => running + row.amount_bdt, 0)
  const people = new Set(payouts.map((row) => row.user_id)).size

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <StatTile
          label="Paid to the team"
          value={formatBdt(total)}
          hint={`${people} ${people === 1 ? "person" : "people"} · ${payouts.length} payout${payouts.length === 1 ? "" : "s"}`}
          icon={<HandCoins className="size-5" />}
          tone={5}
        />
      </div>

      <DataTable
        data={payouts}
        columns={payoutsColumns}
        tableId="payouts"
        {...toTableQueryProps(payoutsQuery)}
        emptyMessage="No payouts recorded yet."
        toolbarAction={<RecordPayoutModal />}
      />
    </div>
  )
}

export default PayoutsTable
