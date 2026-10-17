"use client"

import { deletePaymentAction } from "@/app/(dashboardLayout)/admin/dashboard/payments/_action"
import DeleteMoneyRecordDialog from "@/components/modules/Admin/Money/DeleteMoneyRecordDialog"
import { paymentReversal } from "@/components/modules/Admin/Money/reversalCopy"
import RecordPaymentModal from "@/components/modules/Admin/Payments/RecordPaymentModal"
import { paymentsColumns } from "@/components/modules/Admin/Payments/paymentsColumns"
import DataTable from "@/components/shared/table/DataTable"
import StatTile from "@/components/shared/StatTile"
import { useRowActionModalState } from "@/hooks/useRowActionModalState"
import { formatBdt, formatUsd } from "@/lib/currency"
import { queryKeys } from "@/lib/queryKeys"
import { optionsFromValues } from "@/lib/table/filterOptions"
import { toTableQueryProps } from "@/lib/table/queryProps"
import { plural } from "@/lib/text"
import type { IPayment } from "@/types/billing.types"
import { useQuery } from "@tanstack/react-query"
import { ArrowDownLeft } from "lucide-react"
import { useState } from "react"
import { paymentsListQuery } from "@/queries/billing.queries"

// The page and the API are admin-only, so whoever sees the list may correct it.
const PaymentsTable = () => {
  const [search, setSearch] = useState("")

  const paymentsQuery = useQuery(paymentsListQuery(search ? `search=${encodeURIComponent(search)}` : undefined))

  const payments = paymentsQuery.data?.data ?? []

  const totalUsd = payments.reduce((running, payment) => running + payment.amount_usd, 0)
  const totalBdt = payments.reduce((running, payment) => running + payment.amount_bdt_reporting, 0)

  const {
    editingItem,
    deletingItem,
    isEditModalOpen,
    isDeleteDialogOpen,
    onEditOpenChange,
    onDeleteOpenChange,
    tableActions,
  } = useRowActionModalState<IPayment>({ enableView: false })

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <StatTile
          label="Received (listed)"
          value={formatUsd(totalUsd)}
          // Never added to the USD figure: this is the sum of frozen reporting
          // values, not a conversion of the total above.
          secondary={`${formatBdt(totalBdt)} at recorded rates`}
          hint={plural(payments.length, "payment")}
          icon={<ArrowDownLeft className="size-5" />}
        />
      </div>

      <DataTable
        data={payments}
        columns={paymentsColumns}
        tableId="payments"
        exportFileName="payments"
        filters={{
          configs: [
            {
              id: "account",
              type: "multi-select",
              label: "Into",
              options: optionsFromValues(payments.map((payment) => payment.account?.name)),
            },
            { id: "date", type: "date-range", label: "Date" },
          ],
        }}
        {...toTableQueryProps(paymentsQuery)}
        emptyMessage="No payments recorded yet."
        toolbarAction={<RecordPaymentModal />}
        search={{
          value: search,
          placeholder: "Search reference or client...",
          onDebouncedChange: setSearch,
        }}
        actions={tableActions}
      />

      <RecordPaymentModal payment={editingItem} open={isEditModalOpen} onOpenChange={onEditOpenChange} />

      <DeleteMoneyRecordDialog
        open={isDeleteDialogOpen}
        onOpenChange={onDeleteOpenChange}
        recordId={deletingItem?.id}
        title="Delete this payment?"
        description={deletingItem ? paymentReversal(deletingItem) : ""}
        action={deletePaymentAction}
        successMessage="Payment deleted"
        invalidateKeys={[queryKeys.payments.all, queryKeys.invoices.all, queryKeys.clientFinancials.all]}
      />
    </div>
  )
}

export default PaymentsTable
