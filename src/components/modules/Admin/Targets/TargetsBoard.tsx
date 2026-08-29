"use client"

import {
  deleteTargetAction,
  setTargetAction,
} from "@/app/(dashboardLayout)/admin/dashboard/targets/_action"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getKpiTargets } from "@/services/agencio.services"
import { getAllUsers } from "@/services/user.services"
import type { IKpiTarget, KpiMetric, KpiPeriod } from "@/types/agencio.types"
import type { IUser } from "@/types/user.types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format, startOfMonth, startOfQuarter, startOfYear } from "date-fns"
import { Target as TargetIcon, Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

/**
 * The numbers the company commits to.
 *
 * Without a row here every metric on every dashboard reads "No target set" —
 * a fact with no verdict attached. 62% utilization is neither good nor bad
 * until somebody wrote down what it should have been.
 *
 * Two rules the server enforces and this screen surfaces rather than hides:
 * a percentage metric refuses a target above 100, and a period has to start
 * where its type says it does, so the picker computes period_start rather than
 * letting one be typed.
 */

type MetricSpec = {
  metric: KpiMetric
  label: string
  unit: "%" | "$" | "h" | "×" | ""
  hint: string
}

// The order is the order they matter in, not alphabetical.
const METRICS: MetricSpec[] = [
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

const PERIODS: { value: KpiPeriod; label: string }[] = [
  { value: "month", label: "This month" },
  { value: "quarter", label: "This quarter" },
  { value: "year", label: "This year" },
]

/**
 * Where the period starts, computed rather than typed.
 *
 * The server refuses a quarter that starts in August, and rightly — two "Q3"s
 * beginning on different days cannot be told apart. Deriving it here means
 * that refusal is never reached by accident.
 */
const periodStart = (period: KpiPeriod): string => {
  const today = new Date()
  const start =
    period === "month"
      ? startOfMonth(today)
      : period === "quarter"
        ? startOfQuarter(today)
        : startOfYear(today)

  return format(start, "yyyy-MM-dd")
}

const AGENCY_WIDE = "__agency__"

const TargetsBoard = () => {
  const queryClient = useQueryClient()

  const [metric, setMetric] = useState<KpiMetric>("utilization_pct")
  const [period, setPeriod] = useState<KpiPeriod>("quarter")
  const [owner, setOwner] = useState<string>(AGENCY_WIDE)
  const [value, setValue] = useState("")

  const { data: targetsData, isLoading } = useQuery({
    queryKey: ["kpi-targets"],
    queryFn: () => getKpiTargets(),
  })

  const { data: usersData } = useQuery({
    queryKey: ["users", ""],
    queryFn: () => getAllUsers(),
  })

  const targets = (targetsData?.data ?? []) as IKpiTarget[]
  const users = (usersData?.data ?? []) as IUser[]
  const spec = METRICS.find((entry) => entry.metric === metric) as MetricSpec

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["kpi-targets"] })
    // Every dashboard scores against these, so they are all stale now.
    void queryClient.invalidateQueries({ queryKey: ["kpi"] })
  }

  const { mutate: save, isPending: isSaving } = useMutation({
    mutationFn: () =>
      setTargetAction({
        metric,
        period,
        period_start: periodStart(period),
        target_value: Number(value),
        user_id: owner === AGENCY_WIDE ? null : owner,
      }),
    onSuccess: (result) => {
      if (!result.success) {
        // The server explains a percentage over 100 and a duplicate period by
        // name. Those messages are worth more than "failed".
        toast.error(result.message || "Failed to set the target")
        return
      }
      toast.success("Target set")
      setValue("")
      refresh()
    },
  })

  const { mutate: remove, isPending: isRemoving } = useMutation({
    mutationFn: (id: string) => deleteTargetAction(id),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message || "Failed to delete")
        return
      }
      refresh()
    },
  })

  const labelOf = (target: IKpiTarget) =>
    METRICS.find((entry) => entry.metric === target.metric)?.label ?? target.metric

  const unitOf = (target: IKpiTarget) =>
    METRICS.find((entry) => entry.metric === target.metric)?.unit ?? ""

  const formatValue = (target: IKpiTarget) => {
    const unit = unitOf(target)
    if (unit === "$") return `$${target.target_value.toLocaleString()}`
    return `${target.target_value}${unit}`
  }

  return (
    <div className="space-y-6">
      <Card className="gap-0 p-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle className="text-base">Set a target</CardTitle>
          <p className="text-sm text-muted-foreground">{spec.hint}</p>
        </CardHeader>

        <form
          className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-5"
          onSubmit={(event) => {
            event.preventDefault()
            if (!value.trim() || !Number.isFinite(Number(value))) return
            save()
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="target-metric">Metric</Label>
            <Select value={metric} onValueChange={(next) => setMetric(next as KpiMetric)}>
              <SelectTrigger id="target-metric" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {METRICS.map((entry) => (
                  <SelectItem key={entry.metric} value={entry.metric}>
                    {entry.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="target-period">Period</Label>
            <Select value={period} onValueChange={(next) => setPeriod(next as KpiPeriod)}>
              <SelectTrigger id="target-period" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIODS.map((entry) => (
                  <SelectItem key={entry.value} value={entry.value}>
                    {entry.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="target-owner">Applies to</Label>
            <Select value={owner} onValueChange={setOwner}>
              <SelectTrigger id="target-owner" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {/* An agency target is not the sum of the individual ones, so
                    both can exist for the same metric and period. */}
                <SelectItem value={AGENCY_WIDE}>The whole agency</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="target-value">Target {spec.unit && `(${spec.unit})`}</Label>
            <Input
              id="target-value"
              type="number"
              step="any"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder={spec.unit === "%" ? "70" : spec.unit === "×" ? "3" : "0"}
              disabled={isSaving}
            />
          </div>

          <div className="flex items-end">
            <Button type="submit" className="w-full" disabled={isSaving || !value.trim()}>
              {isSaving ? "Saving..." : "Set target"}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="gap-0 overflow-hidden p-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle className="text-base">Current targets</CardTitle>
          <p className="text-sm text-muted-foreground">
            A dashboard only scores a metric when a target&apos;s period starts inside the
            window being viewed.
          </p>
        </CardHeader>

        {isLoading && targets.length === 0 ? (
          <div className="h-32 animate-pulse bg-muted/40" />
        ) : targets.length === 0 ? (
          <p className="flex flex-col items-center gap-2 px-6 py-12 text-center text-sm text-muted-foreground">
            <TargetIcon className="size-7" aria-hidden="true" />
            No targets yet. Every metric on every dashboard is showing a fact with no
            verdict attached.
          </p>
        ) : (
          <ul className="divide-y">
            {targets.map((target) => (
              <li
                key={target.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {labelOf(target)}
                    <span className="ml-2 font-normal text-muted-foreground">
                      {target.user?.full_name ?? "agency-wide"}
                    </span>
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {target.period} from {target.period_start.slice(0, 10)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <Badge variant="outline" className="tabular-nums">
                    {formatValue(target)}
                  </Badge>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={isRemoving}
                    onClick={() => remove(target.id)}
                  >
                    <Trash2 className="size-3.5" />
                    <span className="sr-only">Delete target</span>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

export default TargetsBoard
