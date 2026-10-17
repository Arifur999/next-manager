"use client"

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
import { METRICS, PERIODS, type MetricSpec } from "@/components/modules/Admin/Targets/targetMetrics"
import type { KpiMetric, KpiPeriod } from "@/types/insights.types"
import type { IUser } from "@/types/user.types"
import { AGENCY_WIDE_TARGET, type IKpiTargetFormValues } from "@/zod/insights.validation"
import { useState } from "react"

const TargetForm = ({
  users,
  onSubmit,
  isPending,
}: {
  users: IUser[]
  // Resolves true once the target is saved.
  onSubmit: (values: IKpiTargetFormValues) => Promise<boolean>
  isPending: boolean
}) => {
  const [metric, setMetric] = useState<KpiMetric>("utilization_pct")
  const [period, setPeriod] = useState<KpiPeriod>("quarter")
  const [owner, setOwner] = useState<string>(AGENCY_WIDE_TARGET)
  const [value, setValue] = useState("")

  const spec = METRICS.find((entry) => entry.metric === metric) as MetricSpec

  const handleSubmit = async () => {
    if (await onSubmit({ metric, period, owner, target_value: value })) setValue("")
  }

  return (
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
          void handleSubmit()
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
              <SelectItem value={AGENCY_WIDE_TARGET}>The whole agency</SelectItem>
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
            disabled={isPending}
          />
        </div>

        <div className="flex items-end">
          <Button type="submit" className="w-full" disabled={isPending || !value.trim()}>
            {isPending ? "Saving..." : "Set target"}
          </Button>
        </div>
      </form>
    </Card>
  )
}

export default TargetForm
