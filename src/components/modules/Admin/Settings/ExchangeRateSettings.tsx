"use client"

import {
  refreshRateAction,
  setDefaultRateAction,
} from "@/app/(dashboardLayout)/admin/dashboard/finance-config/_action"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatRate } from "@/lib/currency"
import { getRateSettings } from "@/services/agencio.services"
import type { IRateSettings } from "@/types/agencio.types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { RefreshCw } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

/**
 * The USD -> BDT rate used for REPORTING.
 *
 * This is not the rate an exchange uses — that one is typed in per exchange
 * because it is what the processor actually paid. This figure only decides how
 * a USD payment is reported in BDT, and it is frozen onto each payment when it
 * is saved, so changing it here never restates history.
 */
const ExchangeRateSettings = () => {
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState("")

  const { data } = useQuery({
    queryKey: ["rate-settings"],
    queryFn: () => getRateSettings(),
  })

  const rates = data?.data as IRateSettings | undefined

  const { mutateAsync: save, isPending: isSaving } = useMutation({
    mutationFn: (rate: number | null) => setDefaultRateAction(rate),
  })

  const { mutateAsync: refresh, isPending: isRefreshing } = useMutation({
    mutationFn: () => refreshRateAction(),
  })

  const handleSave = async () => {
    const value = draft.trim() === "" ? null : Number(draft)

    if (value !== null && !Number.isFinite(value)) {
      toast.error("That is not a number")
      return
    }

    const result = await save(value)

    if (!result.success) {
      toast.error(result.message || "Failed to set the rate")
      return
    }

    toast.success(value === null ? "Using the market rate again" : "Default rate saved")
    setDraft("")
    void queryClient.invalidateQueries({ queryKey: ["rate-settings"] })
  }

  const handleRefresh = async () => {
    const result = await refresh()

    if (!result.success) {
      toast.error(result.message || "Could not reach a rate provider")
      return
    }

    toast.success(
      "data" in result
        ? `Fetched ${formatRate(result.data.rate)} from ${result.data.provider}`
        : "Rate refreshed",
    )
    void queryClient.invalidateQueries({ queryKey: ["rate-settings"] })
  }

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <CardHeader className="border-b px-5 py-4">
        <CardTitle className="text-base">Exchange rate</CardTitle>
        <p className="text-sm text-muted-foreground">
          Used only to report USD payments in BDT. An exchange always uses the rate you actually
          got, typed in at the time.
        </p>
      </CardHeader>

      <div className="space-y-5 px-5 py-5">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <p className="text-xs text-muted-foreground">In force now</p>
            <p className="text-2xl font-semibold tabular-nums">
              {rates?.effective_rate ? formatRate(rates.effective_rate) : "—"}
            </p>
            <p className="text-xs text-muted-foreground">
              {rates?.effective_source === "manual" ? "your default" : "today's market rate"}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void handleRefresh()}
            disabled={isRefreshing}
            className="ml-auto"
          >
            <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Fetching..." : "Fetch market rate"}
          </Button>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="default-rate">Your own default</Label>
          <div className="flex gap-2">
            <Input
              id="default-rate"
              type="number"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={
                rates?.default_usd_rate ? String(rates.default_usd_rate) : "e.g. 119.50"
              }
              disabled={isSaving}
            />
            <Button type="button" onClick={() => void handleSave()} disabled={isSaving}>
              Save
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Worth setting: you know what your processor really pays, and that is a truer figure for
            your books than the market rate. Leave the box empty and press Save to go back to the
            market rate.
          </p>
        </div>

        {rates?.history && rates.history.length > 0 && (
          <div>
            <p className="mb-2 text-xs text-muted-foreground">Recent market rates</p>
            <ul className="divide-y rounded-lg border">
              {rates.history.slice(0, 5).map((entry) => (
                <li key={entry.id} className="flex items-center justify-between px-3 py-2 text-sm">
                  <span className="text-muted-foreground">
                    {format(new Date(entry.date), "MMM dd, yyyy")}
                  </span>
                  <span className="tabular-nums">{formatRate(entry.rate)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  )
}

export default ExchangeRateSettings
