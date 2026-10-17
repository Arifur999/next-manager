import MetricTile, { count, pct, usd } from "@/components/shared/kpi/MetricTile"
import { Card } from "@/components/ui/card"
import { toDate } from "@/lib/dates"
import type { IPlatformFinance } from "@/types/platform.types"
import { format } from "date-fns"

type CompactFigureProps = { label: string; value: string; hint: string }

const CompactFigure = ({ label, value, hint }: CompactFigureProps) => (
  <div className="min-w-0">
    <dt className="truncate text-xs text-muted-foreground">{label}</dt>
    <dd className="text-lg font-semibold tracking-tight tabular-nums">{value}</dd>
    <dd className="text-xs text-muted-foreground">{hint}</dd>
  </div>
)

const windowText = (finance: IPlatformFinance) =>
  `${format(toDate(finance.from), "d MMM")} to ${format(toDate(finance.to), "d MMM yyyy")}`

// The three figures the report is opened for, then the context around them in one compact row.
const FinanceFigures = ({ finance }: { finance: IPlatformFinance }) => (
  <>
    <div className="grid gap-4 lg:grid-cols-3">
      <MetricTile
        label="Monthly revenue"
        metric={{ value: finance.mrr_usd }}
        format={usd}
        size="lead"
        tone={1}
        hint={`${usd(finance.arr_usd)} a year at today's rate. Past due counts, since it is owed.`}
      />
      <MetricTile
        label="Spent in this window"
        metric={{ value: finance.expenses_usd }}
        format={usd}
        size="lead"
        tone={2}
        hint={`${finance.expense_count} ${finance.expense_count === 1 ? "expense" : "expenses"}, ${windowText(finance)}`}
      />
      <MetricTile
        label="Monthly revenue minus costs"
        metric={{ value: finance.net_usd }}
        format={usd}
        size="lead"
        tone={finance.net_usd >= 0 ? 3 : 2}
        hint={`${usd(finance.mrr_usd)} recurring less ${usd(finance.expenses_usd)} spent in this window, not prorated.`}
      />
    </div>

    <Card className="p-5">
      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <CompactFigure
          label="Per paying company"
          value={finance.arpa_usd === null ? "None paying" : usd(finance.arpa_usd)}
          hint={`${finance.paying_companies} paying of ${finance.total_companies}`}
        />
        <CompactFigure
          label="Churn"
          value={finance.churn_rate_pct === null ? "No data yet" : pct(finance.churn_rate_pct)}
          hint={`${finance.churned_in_window} left in this window`}
        />
        <CompactFigure
          label="On trial"
          value={count(finance.by_status.trialing)}
          hint="Not paying yet"
        />
        <CompactFigure
          label="Past due"
          value={count(finance.by_status.past_due)}
          hint="Counted in revenue"
        />
      </dl>
    </Card>
  </>
)

export default FinanceFigures
