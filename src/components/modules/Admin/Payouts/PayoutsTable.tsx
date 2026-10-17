"use client"

import { deleteTeamPayoutAction } from "@/app/(dashboardLayout)/admin/dashboard/payouts/_action"
import DeleteMoneyRecordDialog from "@/components/modules/Admin/Money/DeleteMoneyRecordDialog"
import { payoutReversal } from "@/components/modules/Admin/Money/reversalCopy"
import RecordPayoutModal from "@/components/modules/Admin/Payouts/RecordPayoutModal"
import { payoutsColumns } from "@/components/modules/Admin/Payouts/payoutsColumns"
import StatTile from "@/components/shared/StatTile"
import DataTable from "@/components/shared/table/DataTable"
import { useRowActionModalState } from "@/hooks/useRowActionModalState"
import { formatBdt } from "@/lib/currency"
import { queryKeys } from "@/lib/queryKeys"
import { toTableQueryProps } from "@/lib/table/queryProps"
import { plural } from "@/lib/text"
import type { ITeamPayout } from "@/types/spending.types"
import { useQuery } from "@tanstack/react-query"
import { HandCoins } from "lucide-react"
import { teamPayoutsListQuery } from "@/queries/spending.queries"

const PayoutsTable = () => {
  const payoutsQuery = useQuery(teamPayoutsListQuery())

  const payouts = payoutsQuery.data?.data ?? []
  const total = payouts.reduce((running, row) => running + row.amount_bdt, 0)
  const people = new Set(payouts.map((row) => row.user_id)).size

  const {
    editingItem,
    deletingItem,
    isEditModalOpen,
    isDeleteDialogOpen,
    onEditOpenChange,
    onDeleteOpenChange,
    tableActions,
  } = useRowActionModalState<ITeamPayout>({ enableView: false })

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <StatTile
          label="Paid to the team"
          value={formatBdt(total)}
          hint={`${plural(people, "person", "people")} · ${plural(payouts.length, "payout")}`}
          icon={<HandCoins className="size-5" />}
          tone={5}
        />
      </div>

      <DataTable
        data={payouts}
        columns={payoutsColumns}
        tableId="payouts"
        exportFileName="payouts"
        search={{ placeholder: "Search member, type or account..." }}
        {...toTableQueryProps(payoutsQuery)}
        emptyMessage="No payouts recorded yet."
        toolbarAction={<RecordPayoutModal />}
        actions={tableActions}
      />

      <RecordPayoutModal payout={editingItem} open={isEditModalOpen} onOpenChange={onEditOpenChange} />

      <DeleteMoneyRecordDialog
        open={isDeleteDialogOpen}
        onOpenChange={onDeleteOpenChange}
        recordId={deletingItem?.id}
        title="Delete this payout?"
        description={deletingItem ? payoutReversal(deletingItem) : ""}
        action={deleteTeamPayoutAction}
        successMessage="Payout deleted"
        invalidateKeys={[queryKeys.payouts.all, queryKeys.payroll.all, queryKeys.projectFinancials.all]}
      />
    </div>
  )
}

export default PayoutsTable
