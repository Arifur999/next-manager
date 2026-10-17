"use client"

import RecordWithdrawalModal from "@/components/modules/Admin/Withdrawals/RecordWithdrawalModal"
import { withdrawalsColumns } from "@/components/modules/Admin/Withdrawals/withdrawalsColumns"
import StatTile from "@/components/shared/StatTile"
import DataTable from "@/components/shared/table/DataTable"
import { Card } from "@/components/ui/card"
import { formatBdt } from "@/lib/currency"
import { useQuery } from "@tanstack/react-query"
import { PiggyBank, ShieldAlert } from "lucide-react"
import { ownerWithdrawalsListQuery } from "@/queries/spending.queries"

const WithdrawalsBoard = () => {
  const { data, isPending, isFetching, error } = useQuery({ ...ownerWithdrawalsListQuery(), // The route is owner-only, so anyone else gets a 403. One retry is enough
    // to rule out a blip without hammering a wall that will not move.
    retry: 1 })

  const withdrawals = data?.data ?? []

  const personal = withdrawals
    .filter((row) => row.type === "personal")
    .reduce((running, row) => running + row.amount_bdt, 0)
  const reinvested = withdrawals
    .filter((row) => row.type === "reinvestment")
    .reduce((running, row) => running + row.amount_bdt, 0)

  // A 403 here is the role gate doing its job, not a bug — say so rather than
  // showing an empty table that looks like "no withdrawals".
  if (error) {
    return (
      <Card className="flex flex-col items-center gap-2 px-6 py-16 text-center">
        <ShieldAlert className="size-8 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm font-medium">Owner only</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          What the owner takes out of the business is not visible to other roles, including admins.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <StatTile
          label="Taken personally"
          value={formatBdt(personal)}
          hint="Profit already earned, leaving — never counted as a business cost"
          icon={<PiggyBank className="size-5" />}
          tone={5}
        />
        <StatTile
          label="Put back in"
          value={formatBdt(reinvested)}
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
