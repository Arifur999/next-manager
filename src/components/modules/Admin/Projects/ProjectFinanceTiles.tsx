import StatTile from "@/components/shared/StatTile"
import { formatBdt, formatPercent, formatUsd } from "@/lib/currency"
import type { IProjectFinancials } from "@/types/project.types"
import { ArrowDownLeft, Receipt, TrendingUp } from "lucide-react"

const ProjectFinanceTiles = ({ finance }: { finance: IProjectFinancials }) => (
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <StatTile
      label="Contract value"
      value={formatUsd(finance.contract_value_usd)}
      hint={`${formatUsd(finance.invoiced_usd)} invoiced`}
      tone={2}
    />
    <StatTile
      label="Received"
      value={formatUsd(finance.received_usd)}
      secondary={`${formatBdt(finance.received_bdt)} at recorded rates`}
      hint={`${formatUsd(finance.outstanding_usd)} still owed`}
      icon={<ArrowDownLeft className="size-5" />}
      tone={1}
    />
    <StatTile
      label="Cost"
      value={formatBdt(finance.total_cost_bdt)}
      secondary={`${formatBdt(finance.team_cost_bdt)} team · ${formatBdt(finance.expense_bdt)} expenses`}
      icon={<Receipt className="size-5" />}
      tone={4}
    />
    <StatTile
      label="Profit"
      value={formatBdt(finance.profit_bdt)}
      // Money received minus money spent — not contract value minus cost,
      // because unpaid work is not profit.
      hint={
        finance.received_bdt > 0
          ? `${formatPercent((finance.profit_bdt / finance.received_bdt) * 100)} margin on what has been paid`
          : "Nothing received yet"
      }
      icon={<TrendingUp className="size-5" />}
      tone={3}
    />
  </div>
)

export default ProjectFinanceTiles
