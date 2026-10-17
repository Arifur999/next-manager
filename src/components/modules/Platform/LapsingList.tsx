"use client"

import { companiesMatching } from "@/components/modules/Platform/companyLinks"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import type { IPlatformOverview } from "@/types/platform.types"
import { differenceInCalendarDays, format, parseISO } from "date-fns"
import { CalendarClock } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

type LapsingRow = IPlatformOverview["ending_soon"][number]

// Enough to act on from the dashboard; the rest is one click away.
const SHOWN = 8

const daysLeft = (iso: string | null) => (iso === null ? null : differenceInCalendarDays(parseISO(iso), new Date()))

const urgency = (days: number | null): "destructive" | "outline" =>
  days !== null && days <= 2 ? "destructive" : "outline"

const daysLeftLabel = (days: number | null) => {
  if (days === null) return "no date"
  if (days <= 0) return "today"
  return `${days} ${days === 1 ? "day" : "days"}`
}

const LapsingItem = ({ row }: { row: LapsingRow }) => {
  const days = daysLeft(row.ends_at)

  return (
    <li>
      <Link
        href={companiesMatching(row.organization.email || row.organization.name)}
        className="flex items-center justify-between gap-3 px-5 py-3.5 outline-none hover:bg-muted/40 focus-visible:bg-muted/40"
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{row.organization.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {row.organization.email || "no contact email"} · {row.plan} ·{" "}
            {row.status === "trialing" ? "trial" : "period"} ends{" "}
            {row.ends_at ? format(parseISO(row.ends_at), "d MMM") : "on no set date"}
          </p>
        </div>

        <Badge variant={urgency(days)} className="shrink-0 tabular-nums">
          {daysLeftLabel(days)}
        </Badge>
      </Link>
    </li>
  )
}

// Trials and paid periods ending this week: the list worked through, not read.
const LapsingList = ({ rows }: { rows: LapsingRow[] }) => {
  const [showsAll, setShowsAll] = useState(false)
  const shown = showsAll ? rows : rows.slice(0, SHOWN)

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
        <div>
          <CardTitle className="text-base">Lapsing within a week</CardTitle>
          <p className="text-sm text-muted-foreground">Trials and paid periods that end in the next seven days.</p>
        </div>
        {rows.length > SHOWN && (
          <Button type="button" variant="outline" size="sm" onClick={() => setShowsAll((all) => !all)}>
            {showsAll ? `Show the first ${SHOWN}` : `See all ${rows.length}`}
          </Button>
        )}
      </CardHeader>

      {rows.length === 0 ? (
        <p className="flex flex-col items-center gap-2 px-6 py-10 text-center text-sm text-muted-foreground">
          <CalendarClock className="size-7" aria-hidden="true" />
          Nothing lapses in the next seven days.
        </p>
      ) : (
        <ul className="divide-y">
          {shown.map((row) => (
            <LapsingItem key={row.organization.id} row={row} />
          ))}
        </ul>
      )}
    </Card>
  )
}

export default LapsingList
