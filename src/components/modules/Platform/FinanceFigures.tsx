import MetricTile, { count, pct, usd } from "@/components/shared/kpi/MetricTile"
import type { IPlatformFinance } from "@/types/platform.types"

// The report's figures for one window: what is left, what comes in, what goes out.
const FinanceFigures = ({ finance }: { finance: IPlatformFinance }) => (
  <>
    <div className="grid gap-4 lg:grid-cols-3">
      <MetricTile
        label="Net"
        metric={{ value: finance.net_usd }}
        format={usd}
        size="lead"
        tone={finance.net_usd >= 0 ? 3 : 2}
        hint={`${usd(finance.mrr_usd)} recurring, less ${usd(finance.expenses_usd)} spent in this window`}
      />
      <MetricTile
        label="Monthly revenue"
        metric={{ value: finance.mrr_usd }}
        format={usd}
        tone={1}
        hint={`${usd(finance.arr_usd)} a year at today's rate · counts past due, since it is owed`}
      />
      <MetricTile
        label="Per customer"
        metric={{
          value: finance.arpa_usd,
          // Null is a real answer here and the tile says why rather than
          // showing a zero somebody would read as "we earn nothing".
          reason: "Nobody is paying yet, so there is nothing to divide",
        }}
        format={usd}
        tone={3}
        hint={`Across ${finance.paying_companies} paying of ${finance.total_companies} companies`}
      />
    </div>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricTile
        label="Spent in window"
        metric={{ value: finance.expenses_usd }}
        format={usd}
        tone={2}
        hint={`${finance.expense_count} ${finance.expense_count === 1 ? "entry" : "entries"}`}
      />
      <MetricTile
        label="Churn"
        metric={{
          value: finance.churn_rate_pct,
          reason: "Nobody has paid or left yet",
        }}
        format={pct}
        tone={2}
        hint={`${finance.churned_in_window} left in this window`}
      />
      <MetricTile
        label="On trial"
        metric={{ value: finance.by_status.trialing }}
        format={count}
        tone={1}
        hint="Worth nothing yet, by definition"
      />
      <MetricTile
        label="Past due"
        metric={{ value: finance.by_status.past_due }}
        format={count}
        tone={2}
        hint="Counted in revenue — the money is still owed"
      />
    </div>
  </>
)

export default FinanceFigures
