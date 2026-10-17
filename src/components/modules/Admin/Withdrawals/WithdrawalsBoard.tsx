"use client"

import RecordWithdrawalModal from "@/components/modules/Admin/Withdrawals/RecordWithdrawalModal"
import { withdrawalsColumns } from "@/components/modules/Admin/Withdrawals/withdrawalsColumns"
import StatTile from "@/components/shared/StatTile"
import ErrorState from "@/components/shared/state/ErrorState"
import DataTable from "@/components/shared/table/DataTable"
import { Card } from "@/components/ui/card"
import { formatBdt } from "@/lib/currency"
import { useQuery } from "@tanstack/react-query"
import { PiggyBank } from "lucide-react"
import { ownerWithdrawalsListQuery } from "@/queries/spending.queries"

const WithdrawalsBoard = () => {
  // One automatic retry rules out a blip; past that, the Retry button is
  // quicker than a backoff.
  const { data, isPending, isFetching, isError, refetch } = useQuery({ ...ownerWithdrawalsListQuery(), retry: 1 })

  const withdrawals = data?.data ?? []

  const personalBdt = withdrawals
    .filter((withdrawal) => withdrawal.type === "personal")
    .reduce((running, withdrawal) => running + withdrawal.amount_bdt, 0)
  const reinvestedBdt = withdrawals
    .filter((withdrawal) => withdrawal.type === "reinvestment")
    .reduce((running, withdrawal) => running + withdrawal.amount_bdt, 0)

  // Never an empty table that reads as "no withdrawals". Not a permission
  // message either: the page and the API are both admin-only, and a thrown
  // server-action error reaches the browser without its status, so a 403
  // cannot be told from an outage here.
  if (isError) {
    return (
      <Card>
        <ErrorState
          message="Withdrawals did not load."
          onRetry={() => void refetch()}
          isRetrying={isFetching}
        />
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <StatTile
          label="Taken personally"
          value={formatBdt(personalBdt)}
          hint="Profit already earned, leaving — never counted as a business cost"
          icon={<PiggyBank className="size-5" />}
          tone={5}
        />
        <StatTile
          label="Put back in"
          value={formatBdt(reinvestedBdt)}
          hint="Reinvested into the business"
          icon={<PiggyBank className="size-5" />}
          tone={3}
        />
      </div>

      <DataTable
        data={withdrawals}
        columns={withdrawalsColumns}
        tableId="withdrawals"
        exportFileName="withdrawals"
        search={{ placeholder: "Search type, account or notes..." }}
        filters={{
          configs: [
            {
              id: "type",
              type: "multi-select",
              label: "Type",
              options: [
                { label: "Personal", value: "personal" },
                { label: "Reinvestment", value: "reinvestment" },
              ],
            },
            { id: "date", type: "date-range", label: "Date" },
          ],
        }}
        isLoading={isPending}
        isFetching={isFetching}
        emptyMessage="No withdrawals recorded yet."
        toolbarAction={<RecordWithdrawalModal />}
      />
    </div>
  )
}

export default WithdrawalsBoard
