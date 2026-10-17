"use client"

import RelativeTime from "@/components/shared/RelativeTime"
import EmptyState from "@/components/shared/state/EmptyState"
import PanelState from "@/components/shared/state/PanelState"
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
import type { IPlatformActivity } from "@/types/platform.types"
import { useInfiniteQuery } from "@tanstack/react-query"
import { format, isToday, isYesterday, parseISO } from "date-fns"
import { History } from "lucide-react"
import { useState } from "react"
import { platformActivityFeedQuery } from "@/queries/platform.queries"

/**
 * What the platform team has been doing: every entry is an action taken
 * against a paying customer, or a change to what a colleague may do.
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

  const feed = useInfiniteQuery(
    platformActivityFeedQuery({ entity_type: entityType === ALL ? undefined : entityType }),
  )

  const entries = feed.data?.pages.flatMap((page) => page.data) ?? []
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

      <PanelState
        query={feed}
        errorMessage="Admin activity did not load."
        isEmpty={entries.length === 0}
        empty={
          <EmptyState icon={History}>
            {entityType === ALL ? "Nothing recorded yet." : "Nothing matches that filter."}
          </EmptyState>
        }
      >
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
                      <RelativeTime value={entry.created_at} />
                    </time>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {feed.hasNextPage && (
            <div className="border-t px-5 py-4 text-center">
              <Button
                type="button"
                variant="outline"
                disabled={feed.isFetchingNextPage}
                onClick={() => feed.fetchNextPage()}
              >
                {feed.isFetchingNextPage ? "Loading..." : "Show more"}
              </Button>
            </div>
          )}
        </div>
      </PanelState>
    </Card>
  )
}

export default PlatformActivityFeed
