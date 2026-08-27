"use client"

import RecordPaymentModal from "@/components/modules/Admin/Payments/RecordPaymentModal"
import { paymentsColumns } from "@/components/modules/Admin/Payments/paymentsColumns"
import DataTable from "@/components/shared/table/DataTable"
import StatTile from "@/components/shared/StatTile"
import { formatBdt, formatUsd } from "@/lib/currency"
import { getPayments } from "@/services/agencio.services"
import type { IPayment } from "@/types/agencio.types"
import { useQuery } from "@tanstack/react-query"
import { ArrowDownLeft } from "lucide-react"
import { useState } from "react"

const PaymentsTable = () => {
  const [search, setSearch] = useState("")

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["payments", search],
    queryFn: () => getPayments(search ? `search=${encodeURIComponent(search)}` : undefined),
  })

  const payments = (data?.data ?? []) as IPayment[]

  const totalUsd = payments.reduce((running, payment) => running + payment.amount_usd, 0)
  const totalBdt = payments.reduce((running, payment) => running + payment.amount_bdt_reporting, 0)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <StatTile
          label="Received (listed)"
          value={formatUsd(totalUsd)}
          // Never added to the USD figure: this is the sum of frozen reporting
          // values, not a conversion of the total above.
          secondary={`${formatBdt(totalBdt)} at recorded rates`}
          hint={`${payments.length} payment${payments.length === 1 ? "" : "s"}`}
          icon={<ArrowDownLeft className="size-5" />}
          tone={1}
        />
      </div>

      <DataTable
        data={payments}
        columns={paymentsColumns}
        isLoading={isLoading || isFetching}
        emptyMessage="No payments recorded yet."
        toolbarAction={<RecordPaymentModal />}
        search={{
          initialValue: search,
          placeholder: "Search reference or client...",
          onDebouncedChange: setSearch,
        }}
      />
    </div>
  )
}

export default PaymentsTable
