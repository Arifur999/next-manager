"use client"

import { Button } from "@/components/ui/button"
import {
  endOfMonth,
  endOfQuarter,
  format,
  startOfMonth,
  startOfQuarter,
  subDays,
} from "date-fns"
import { useState } from "react"

/**
 * The window every KPI on a screen is computed over.
 *
 * Presets rather than a free date picker, and the presets are the periods
 * targets can be set for. A target is stored against a month, a quarter or a
 * year, and the engine only counts a target whose period starts inside the
 * window being asked about — so an arbitrary "12 Mar to 4 Aug" would show
 * metrics with every target missing and no hint as to why.
 *
 * "Last 30 days" is the exception and the default: it is the rolling read, and
 * it is the one preset where an absent target is expected rather than
 * confusing.
 */

export type RangePreset = "30d" | "month" | "quarter"

const iso = (date: Date) => format(date, "yyyy-MM-dd")

const rangeOf = (preset: RangePreset): { from: string; to: string } => {
  const today = new Date()

  switch (preset) {
    case "month":
      return { from: iso(startOfMonth(today)), to: iso(endOfMonth(today)) }
    case "quarter":
      return { from: iso(startOfQuarter(today)), to: iso(endOfQuarter(today)) }
    case "30d":
    default:
      return { from: iso(subDays(today, 29)), to: iso(today) }
  }
}

const LABELS: Record<RangePreset, string> = {
  "30d": "Last 30 days",
  month: "This month",
  quarter: "This quarter",
}

export const useKpiRange = () => {
  const [preset, setPreset] = useState<RangePreset>("30d")
  const { from, to } = rangeOf(preset)

  return { preset, setPreset, query: `from=${from}&to=${to}`, from, to }
}

export const KpiRangePicker = ({
  preset,
  onChange,
}: {
  preset: RangePreset
  onChange: (next: RangePreset) => void
}) => (
  <div className="flex flex-wrap items-center gap-2">
    {(Object.keys(LABELS) as RangePreset[]).map((option) => (
      <Button
        key={option}
        type="button"
        size="sm"
        variant={option === preset ? "default" : "outline"}
        onClick={() => onChange(option)}
        aria-pressed={option === preset}
      >
        {LABELS[option]}
      </Button>
    ))}
  </div>
)
