"use client"

import RecordExchangeModal from "@/components/modules/Admin/Exchange/RecordExchangeModal"
import { exchangeColumns } from "@/components/modules/Admin/Exchange/exchangeColumns"
import StatTile from "@/components/shared/StatTile"
import DataTable from "@/components/shared/table/DataTable"
import { formatBdt, formatRate, formatUsd } from "@/lib/currency"
import { getExchanges } from "@/services/agencio.services"
import type { IExchange } from "@/types/agencio.types"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeftRight, TrendingDown } from "lucide-react"

const ExchangeTable = () => {
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["exchanges"],
    queryFn: () => getExchanges(),
  })

  const exchanges = (data?.data ?? []) as IExchange[]

  const sentUsd = exchanges.reduce((running, row) => running + row.amount_usd, 0)
  const receivedBdt = exchanges.reduce((running, row) => running + row.amount_bdt, 0)
  const feesUsd = exchanges.reduce((running, row) => running + row.fee_usd, 0)

  // The blended rate the agency really achieved across everything exchanged —
  // fees included, which is why it reads lower than any single quoted rate.
  const effectiveRate = sentUsd > 0 ? receivedBdt / sentUsd : 0

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatTile
          label="Exchanged"
          value={formatUsd(sentUsd)}
          secondary={`${formatBdt(receivedBdt)} received`}
          hint={`${exchanges.length} exchange${exchanges.length === 1 ? "" : "s"}`}
          icon={<ArrowLeftRight className="size-5" />}
          tone={2}
        />
        <StatTile
          label="Blended rate achieved"
          value={effectiveRate ? formatRate(effectiveRate) : "—"}
          hint="Across everything exchanged, fees included"
          icon={<TrendingDown className="size-5" />}
          tone={4}
        />
        <StatTile
          label="Lost to fees"
          value={formatUsd(feesUsd)}
          hint="Withheld by processors before conversion"
          icon={<TrendingDown className="size-5" />}
          tone={5}
        />
      </div>

      <DataTable
        data={exchanges}
        columns={exchangeColumns}
        isLoading={isLoading || isFetching}
        emptyMessage="No exchanges recorded yet."
        toolbarAction={<RecordExchangeModal />}
      />

      <p className="text-xs text-muted-foreground">
        The rate on each row is what the processor actually paid, not the market rate — that gap is
        their margin, and recording the real figure is what keeps the books reconciling.
      </p>
    </div>
  )
}

export default ExchangeTable
