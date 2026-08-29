"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getPlatformActivity } from "@/services/agencio.services"
import type { IPlatformActivity } from "@/types/platform.types"
import { useQuery } from "@tanstack/react-query"
import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from "date-fns"
import { History } from "lucide-react"
import { useState } from "react"

/**
 * What the platform team has been doing.
 *
 * Every entry here is an action taken against a paying customer — suspending
 * one, moving it between plans, changing what a colleague may do. Nothing
 * recorded any of it before, which was survivable with one operator and is
 * not with a team.
 *
 * Read-only all the way down: there is no delete button because there is no
 * delete endpoint, because a history somebody can edit answers nothing.
 */

const ALL = "__all__"

const ENTITY_LABELS: Record<string, string> = {
  company: "Companies",
  plan: "Plans",
  subscription: "Subscriptions",
  admin: "Team",
  campaign: "Campaigns",
  expense: "Expenses",
}

// Suspending a customer and removing an operator are what somebody comes here
// looking for; the rest is the context around them.
const toneOf = (action: string): "destructive" | "secondary" | "outline" =>
  action === "deleted" ? "destructive" : action === "created" ? "secondary" : "outline"

const dayLabel = (iso: string) => {
  const date = parseISO(iso)
  if (isToday(date)) return "Today"
  if (isYesterday(date)) return "Yesterday"
  return format(date, "EEEE d MMMM yyyy")
}

const groupByDay = (entries: IPlatformActivity[]) => {
  const days = new Map<string, IPlatformActivity[]>()

  for (const entry of entries) {
    const key = entry.created_at.slice(0, 10)
    const existing = days.get(key)
    if (existing) existing.push(entry)
    else days.set(key, [entry])
  }

  return [...days.entries()]
}

const PlatformActivityFeed = () => {
  const [entityType, setEntityType] = useState(ALL)
  const [limit, setLimit] = useState(100)

  const query = [`limit=${limit}`, entityType === ALL ? "" : `entity_type=${entityType}`]
    .filter(Boolean)
    .join("&")

  const { data, isLoading } = useQuery({
    queryKey: ["platform-activity", query],
    queryFn: () => getPlatformActivity(query),
  })

  const entries = (data?.data ?? []) as IPlatformActivity[]
  const grouped = groupByDay(entries)

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
        <div>
          <CardTitle className="text-base">Admin activity</CardTitle>
          <p className="text-sm text-muted-foreground">
            Everything the platform team has done, in the words recorded at the time.
            Nothing here can be edited or removed.
          </p>
        </div>

        <Select value={entityType} onValueChange={setEntityType}>
          <SelectTrigger className="w-44" aria-label="Filter by what was touched">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Everything</SelectItem>
            {Object.entries(ENTITY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>

      {isLoading && entries.length === 0 ? (
        <div className="h-40 animate-pulse bg-muted/40" />
      ) : entries.length === 0 ? (
        <p className="flex flex-col items-center gap-2 px-6 py-12 text-center text-sm text-muted-foreground">
          <History className="size-7" aria-hidden="true" />
          Nothing matches that filter.
        </p>
      ) : (
        <div>
          {grouped.map(([day, dayEntries]) => (
            <section key={day}>
              <header className="sticky top-0 border-b bg-muted/40 px-5 py-2 backdrop-blur">
                <p className="text-xs font-medium text-muted-foreground">
                  {dayLabel(dayEntries[0].created_at)}
                </p>
              </header>

              <ul className="divide-y">
                {dayEntries.map((entry) => (
                  <li key={entry.id} className="flex flex-wrap items-start gap-3 px-5 py-3.5">
                    <Badge variant={toneOf(entry.action)} className="mt-0.5 shrink-0 text-xs">
                      {entry.action.replace(/_/g, " ")}
                    </Badge>

                    <div className="min-w-40 flex-1">
                      <p className="text-sm">{entry.summary}</p>
                      <p className="text-xs text-muted-foreground">
                        {/* Removing an operator nulls the link but keeps what
                            they did, so an unattributed entry is a real state. */}
                        {entry.actor?.full_name ?? "a since-removed operator"}
                        {" · "}
                        {ENTITY_LABELS[entry.entity_type] ?? entry.entity_type}
                      </p>
                    </div>

                    <time
                      className="shrink-0 text-xs text-muted-foreground tabular-nums"
                      dateTime={entry.created_at}
                      title={format(parseISO(entry.created_at), "d MMM yyyy, HH:mm:ss")}
                    >
                      {formatDistanceToNow(parseISO(entry.created_at), { addSuffix: true })}
                    </time>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {entries.length >= limit && (
            <div className="border-t px-5 py-4 text-center">
              <Button type="button" variant="outline" onClick={() => setLimit((n) => n + 100)}>
                Show more
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

export default PlatformActivityFeed
