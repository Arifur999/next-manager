"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState, type ReactNode } from "react"

/**
 * A month, as a grid.
 *
 * Deliberately knows nothing about what it is showing. It hands each cell its
 * date and asks the caller what belongs there — which is why the task calendar
 * and the leave calendar are the same component with different contents rather
 * than two grids that drift apart.
 *
 * The grid is padded out to whole weeks, so the last row is never short and the
 * columns stay under their weekday headings. Days from the neighbouring months
 * are drawn dimmed rather than blank: a task due on the 1st is easier to find
 * when the last week of the previous month is visible than when it is a hole.
 */

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const MonthGrid = <TItem,>({
  items,
  dateOf,
  renderItem,
  emptyLabel,
}: {
  items: TItem[]
  /** The day an item belongs on, or null to leave it off the calendar. */
  dateOf: (item: TItem) => Date | null
  renderItem: (item: TItem) => ReactNode
  emptyLabel?: string
}) => {
  const [month, setMonth] = useState(() => startOfMonth(new Date()))

  // Whole weeks, Monday first — the week most of the world plans against.
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
  })

  // Bucketed once rather than filtered per cell: filtering inside the loop is
  // one pass over every item for each of forty-two days.
  const byDay = new Map<string, TItem[]>()
  for (const item of items) {
    const date = dateOf(item)
    if (!date) continue
    const key = format(date, "yyyy-MM-dd")
    byDay.set(key, [...(byDay.get(key) ?? []), item])
  }

  const placed = [...byDay.values()].reduce((total, list) => total + list.length, 0)

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <p className="font-medium">{format(month, "MMMM yyyy")}</p>

        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setMonth(subMonths(month, 1))}
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setMonth(startOfMonth(new Date()))}>
            Today
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setMonth(addMonths(month, 1))}
            aria-label="Next month"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* The whole grid scrolls sideways rather than the page: seven columns do
          not fit a phone, and a page that scrolls horizontally is unusable. */}
      <div className="overflow-x-auto">
        <div className="min-w-[44rem]">
          <div className="grid grid-cols-7 border-b bg-muted/40">
            {WEEKDAYS.map((day) => (
              <div key={day} className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {days.map((day) => {
              const key = format(day, "yyyy-MM-dd")
              const dayItems = byDay.get(key) ?? []
              const outside = !isSameMonth(day, month)

              return (
                <div
                  key={key}
                  className={cn(
                    "min-h-24 space-y-1 border-b border-r p-1.5",
                    outside && "bg-muted/30"
                  )}
                >
                  <p
                    className={cn(
                      "text-xs",
                      outside ? "text-muted-foreground/60" : "text-muted-foreground",
                      isToday(day) &&
                        "inline-flex size-5 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground"
                    )}
                  >
                    {format(day, "d")}
                  </p>

                  {dayItems.map((item, index) => (
                    <div key={index}>{renderItem(item)}</div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Says so rather than showing an empty month and letting the reader
          wonder whether it is loading. */}
      {placed === 0 && emptyLabel && (
        <p className="border-t px-4 py-3 text-sm text-muted-foreground">{emptyLabel}</p>
      )}
    </Card>
  )
}

export default MonthGrid
