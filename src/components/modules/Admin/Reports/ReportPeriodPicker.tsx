"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatRange, isCalendarDay } from "@/lib/dates"
import { presetOf, rangeOf, REPORT_PERIODS, type ReportRange } from "@/lib/reportPeriod"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

const CUSTOM = "custom"

const dayOrUndefined = (value: string | null) => (value && isCalendarDay(value) ? value : undefined)

/**
 * The period every figure on a report page covers, kept in the URL as from/to
 * so a view survives a refresh and can be sent to a colleague. The page reads
 * the same two values, so its prefetch and these queries share one key.
 */
const ReportPeriodPicker = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const from = dayOrUndefined(searchParams.get("from"))
  const to = dayOrUndefined(searchParams.get("to"))

  const preset = presetOf(from, to)
  const [isCustom, setIsCustom] = useState(preset === CUSTOM)
  const [draft, setDraft] = useState({ from: from ?? "", to: to ?? "" })

  const apply = (range: ReportRange | null) => {
    const next = new URLSearchParams(searchParams.toString())
    next.delete("from")
    next.delete("to")
    if (range) {
      next.set("from", range.from)
      next.set("to", range.to)
    }
    const query = next.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  const choose = (value: string) => {
    const picked = REPORT_PERIODS.find((period) => period.value === value)
    if (!picked) {
      setIsCustom(true)
      return
    }
    setIsCustom(false)
    apply(rangeOf(picked.value))
  }

  const isDraftValid = isCalendarDay(draft.from) && isCalendarDay(draft.to) && draft.from <= draft.to

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1.5">
        <Label htmlFor="report-period">Period</Label>
        <Select value={isCustom ? CUSTOM : preset} onValueChange={choose}>
          <SelectTrigger id="report-period" className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {REPORT_PERIODS.map((period) => (
              <SelectItem key={period.value} value={period.value}>
                {period.label}
              </SelectItem>
            ))}
            <SelectItem value={CUSTOM}>Custom range</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isCustom && (
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(event) => {
            event.preventDefault()
            if (isDraftValid) apply(draft)
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="report-from">From</Label>
            <Input
              id="report-from"
              type="date"
              value={draft.from}
              onChange={(event) => setDraft((current) => ({ ...current, from: event.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="report-to">To</Label>
            <Input
              id="report-to"
              type="date"
              value={draft.to}
              onChange={(event) => setDraft((current) => ({ ...current, to: event.target.value }))}
            />
          </div>
          <Button type="submit" variant="outline" disabled={!isDraftValid}>
            Apply
          </Button>
        </form>
      )}

      {from && to && !isCustom && (
        <p className="pb-2 text-sm text-muted-foreground">{formatRange(from, to)}</p>
      )}
    </div>
  )
}

export default ReportPeriodPicker
