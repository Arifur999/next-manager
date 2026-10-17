import StatTile from "@/components/shared/StatTile"
import { formatBdt, formatUsd } from "@/lib/currency"
import type { IClientFinancials } from "@/types/crm.types"
import { format } from "date-fns"
import { ArrowDownLeft, FileText, FolderKanban, TrendingUp } from "lucide-react"

const ClientFinanceTiles = ({ finance }: { finance: IClientFinancials }) => (
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <StatTile
      label="Lifetime value"
      value={formatUsd(finance.lifetime_value_usd)}
      secondary={`${formatBdt(finance.lifetime_value_bdt_reporting)} at recorded rates`}
      // Money in the bank, not money hoped for — the server counts
      // received, never invoiced.
      hint={`${finance.payment_count} payment${finance.payment_count === 1 ? "" : "s"} received`}
      icon={<TrendingUp className="size-5" />}
      tone={1}
    />
    <StatTile
      label="Invoiced"
      value={formatUsd(finance.total_invoiced_usd)}
      hint="Excludes drafts and cancelled invoices"
      icon={<FileText className="size-5" />}
      tone={2}
    />
    <StatTile
      label="Outstanding"
      value={formatUsd(finance.outstanding_usd)}
      hint="Floored at zero — an overpayment is a credit, not a negative debt"
      icon={<ArrowDownLeft className="size-5" />}
      tone={4}
    />
    <StatTile
      label="Projects"
      value={String(finance.project_count)}
      hint={`Client since ${format(new Date(finance.client_since), "MMM yyyy")}`}
      icon={<FolderKanban className="size-5" />}
      tone={3}
    />
  </div>
)

export default ClientFinanceTiles
