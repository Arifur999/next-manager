"use client"

import LogTimeModal from "@/components/modules/Admin/Time/LogTimeModal"
import StatTile from "@/components/shared/StatTile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { getTimeEntries, getTimeSummary } from "@/services/agencio.services"
import type { ITimeEntry, ITimeSummary } from "@/types/agencio.types"
import { useQuery } from "@tanstack/react-query"
import { addDays, format, startOfWeek } from "date-fns"
import { ChevronLeft, ChevronRight, Clock, Lock, TrendingUp } from "lucide-react"
import { useState } from "react"

/**
 * One person's week.
 *
 * A grid rather than a list because the question being asked is "which day is
 * short", and a list of entries sorted by date makes the reader do that
 * subtraction themselves.
 *
 * Utilization is shown against the hours actually logged, not against a
 * capacity — capacity lives on the team screen, and showing a personal
 * percentage here against a number this person cannot see would be a figure
 * they could not check.
 */

const iso = (date: Date) => format(date, "yyyy-MM-dd")

// Weeks start Monday: a timesheet that starts Sunday puts the weekend at both
// ends and nobody reads it that way.
const weekStart = (offset: number) =>
  startOfWeek(addDays(new Date(), offset * 7), { weekStartsOn: 1 })

const TimesheetBoard = ({ canApprove = false }: { canApprove?: boolean }) => {
  const [offset, setOffset] = useState(0)

  const start = weekStart(offset)
  const end = addDays(start, 6)
  const range = `from=${iso(start)}&to=${iso(end)}`

  const { data: entriesData, isLoading } = useQuery({
    queryKey: ["time-entries", range],
    queryFn: () => getTimeEntries(range),
  })
  const { data: summaryData } = useQuery({
    queryKey: ["time-summary", range],
    queryFn: () => getTimeSummary(range),
  })

  const entries = (entriesData?.data ?? []) as ITimeEntry[]
  const summary = summaryData?.data as ITimeSummary | undefined

  const days = Array.from({ length: 7 }, (_, index) => addDays(start, index))

  const hoursOn = (day: Date) =>
    entries
      .filter((entry) => entry.date === iso(day))
      .reduce((running, entry) => running + entry.hours, 0)

  const billableShare =
    summary && summary.total_hours > 0
      ? (summary.billable_hours / summary.total_hours) * 100
      : 0

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatTile
          label="Logged this week"
          value={`${(summary?.total_hours ?? 0).toFixed(2)} h`}
          secondary={`${(summary?.billable_hours ?? 0).toFixed(2)} h billable`}
          icon={<Clock className="size-5" />}
          tone={1}
        />
        <StatTile
          label="Billable share"
          value={`${billableShare.toFixed(0)}%`}
          hint="Of the hours logged — not of your capacity"
          icon={<TrendingUp className="size-5" />}
          tone={3}
        />
      </div>

      <Card className="gap-0 overflow-hidden p-0">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
          <div>
            <CardTitle className="text-base">
              {format(start, "MMM dd")} – {format(end, "MMM dd, yyyy")}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {offset === 0 ? "This week" : offset === -1 ? "Last week" : format(start, "'Week of' MMM dd")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="icon" onClick={() => setOffset((o) => o - 1)}>
              <ChevronLeft className="size-4" />
              <span className="sr-only">Previous week</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOffset(0)}
              disabled={offset === 0}
            >
              Today
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setOffset((o) => o + 1)}
              // Logging future hours is not a thing anybody should be doing.
              disabled={offset >= 0}
            >
              <ChevronRight className="size-4" />
              <span className="sr-only">Next week</span>
            </Button>

            <LogTimeModal defaultDate={iso(offset === 0 ? new Date() : start)} />
          </div>
        </CardHeader>

        {/* The week strip: which day is short is the whole question. */}
        <div className="grid grid-cols-7 border-b">
          {days.map((day) => {
            const hours = hoursOn(day)
            const isToday = iso(day) === iso(new Date())

            return (
              <div
                key={iso(day)}
                className={`border-r px-2 py-3 text-center last:border-r-0 ${
                  isToday ? "bg-muted/50" : ""
                }`}
              >
                <p className="text-xs text-muted-foreground">{format(day, "EEE")}</p>
                <p className="text-xs text-muted-foreground">{format(day, "dd")}</p>
                <p
                  className={`mt-1 text-sm font-medium tabular-nums ${
                    hours === 0 ? "text-muted-foreground" : ""
                  }`}
                >
                  {hours === 0 ? "—" : `${hours.toFixed(1)}h`}
                </p>
              </div>
            )
          })}
        </div>

        {isLoading && entries.length === 0 ? (
          <div className="h-40 animate-pulse bg-muted/40" />
        ) : entries.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-muted-foreground">
            Nothing logged this week.
          </p>
        ) : (
          <ul className="divide-y">
            {entries.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {entry.project?.name ?? "Project"}
                    {entry.task ? ` · ${entry.task.title}` : ""}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {format(new Date(entry.date), "EEE dd MMM")}
                    {canApprove && entry.user ? ` · ${entry.user.full_name}` : ""}
                    {entry.notes ? ` · ${entry.notes}` : ""}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {!entry.is_billable && (
                    <Badge variant="outline" className="text-xs">
                      non-billable
                    </Badge>
                  )}
                  {entry.approved_at && (
                    // Approved entries cannot be edited, so the lock is not
                    // decoration — it says why the row is now read-only.
                    <span
                      className="flex items-center gap-1 text-xs text-muted-foreground"
                      title="Approved — no longer editable"
                    >
                      <Lock className="size-3" aria-hidden="true" />
                      approved
                    </span>
                  )}
                  <span className="text-sm font-medium tabular-nums">{entry.hours.toFixed(2)} h</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

export default TimesheetBoard
