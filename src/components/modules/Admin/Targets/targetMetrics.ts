import type { KpiMetric, KpiPeriod } from "@/types/insights.types"
import { format, startOfMonth, startOfQuarter, startOfYear } from "date-fns"

export type MetricSpec = {
  metric: KpiMetric
  label: string
  unit: "%" | "$" | "h" | "×" | ""
  hint: string
}

// The order is the order they matter in, not alphabetical.
export const METRICS: MetricSpec[] = [
  {
    metric: "utilization_pct",
    label: "Utilization",
    unit: "%",
    hint: "Billable hours over available. 65–80% is the healthy band.",
  },
  {
    metric: "realization_pct",
    label: "Realization",
    unit: "%",
    hint: "Billable time that turns into collected money. Above 85%.",
  },
  {
    metric: "revenue_usd",
    label: "Revenue",
    unit: "$",
    hint: "Collected in the period. Also the denominator for pipeline coverage.",
  },
  {
    metric: "gross_margin_pct",
    label: "Gross margin",
    unit: "%",
    hint: "Revenue less direct cost, in BDT.",
  },
  {
    metric: "on_time_delivery_pct",
    label: "On-time delivery",
    unit: "%",
    hint: "Milestones submitted by their due date. Above 90%.",
  },
  {
    metric: "win_rate_pct",
    label: "Win rate",
    unit: "%",
    hint: "Of the deals actually decided.",
  },
  {
    metric: "pipeline_coverage",
    label: "Pipeline coverage",
    unit: "×",
    hint: "Open pipeline over the revenue target. 3–4× is healthy.",
  },
  { metric: "deals_won", label: "Deals won", unit: "", hint: "Count of deals landed." },
  { metric: "deal_value_usd", label: "Won value", unit: "$", hint: "Value of the deals landed." },
  {
    metric: "billable_hours",
    label: "Billable hours",
    unit: "h",
    hint: "Usually set per person rather than agency-wide.",
  },
  {
    metric: "project_margin_pct",
    label: "Project margin",
    unit: "%",
    hint: "60–70% of adjusted gross income.",
  },
]

// Every API metric has a spec above; the fallback keeps one added later
// readable by its raw name instead of blank.
export const specOf = (metric: KpiMetric): MetricSpec =>
  METRICS.find((entry) => entry.metric === metric) ?? { metric, label: metric, unit: "", hint: "" }

export const PERIODS: { value: KpiPeriod; label: string }[] = [
  { value: "month", label: "This month" },
  { value: "quarter", label: "This quarter" },
  { value: "year", label: "This year" },
]

const START_OF: Record<KpiPeriod, (date: Date) => Date> = {
  month: startOfMonth,
  quarter: startOfQuarter,
  year: startOfYear,
}

/**
 * Where the period starts, computed rather than typed.
 *
 * The server refuses a quarter that starts in August, and rightly — two "Q3"s
 * beginning on different days cannot be told apart. Deriving it here means
 * that refusal is never reached by accident.
 */
export const periodStart = (period: KpiPeriod): string => format(START_OF[period](new Date()), "yyyy-MM-dd")
