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
import { getActivity, getActivityFilters } from "@/services/agencio.services"
import type { IActivityEntry, IActivityFilters } from "@/types/agencio.types"
import { useQuery } from "@tanstack/react-query"
import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from "date-fns"
import { History } from "lucide-react"
import { useState } from "react"

/**
 * Who did what, across the whole company.
 *
 * The summaries were written at the moment of the action and are shown exactly
 * as stored — never re-derived from the record they describe, which for a
 * deletion no longer exists. That is the entire reason this reads correctly
 * for the things it is most needed for.
 *
 * Grouped by day rather than shown as one long list. "What happened on the
 * 14th" is the question an audit trail gets opened with; a flat feed makes the
 * reader find the boundary themselves.
 */

const ALL = "__all__"

// A deletion is the entry somebody comes here looking for, so it is the one
// that carries a visible label. The others are context around it.
const ACTION_TONE = (action: string): "outline" | "secondary" | "destructive" =>
  action === "deleted" ? "destructive" : action === "created" ? "secondary" : "outline"

const dayLabel = (iso: string) => {
  const date = parseISO(iso)
  if (isToday(date)) return "Today"
  if (isYesterday(date)) return "Yesterday"
  return format(date, "EEEE d MMMM yyyy")
}

const groupByDay = (entries: IActivityEntry[]) => {
  const days = new Map<string, IActivityEntry[]>()

  for (const entry of entries) {
    const key = entry.created_at.slice(0, 10)
    const existing = days.get(key)
    if (existing) existing.push(entry)
    else days.set(key, [entry])
  }

  // The API returns newest first, so insertion order is already right.
  return [...days.entries()]
}

const ActivityFeed = () => {
  const [entityType, setEntityType] = useState(ALL)
  const [action, setAction] = useState(ALL)
  const [limit, setLimit] = useState(50)

  const query = [
    `limit=${limit}`,
    entityType === ALL ? "" : `entity_type=${entityType}`,
    action === ALL ? "" : `action=${action}`,
  ]
    .filter(Boolean)
    .join("&")

  const { data, isLoading } = useQuery({
    queryKey: ["activity", query],
    queryFn: () => getActivity(query),
  })

  const { data: filterData } = useQuery({
    queryKey: ["activity-filters"],
    queryFn: () => getActivityFilters(),
  })

  const entries = (data?.data ?? []) as IActivityEntry[]
  const filters = filterData?.data as IActivityFilters | undefined
  const total = data?.meta?.total ?? entries.length
  const grouped = groupByDay(entries)

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
        <div>
          <CardTitle className="text-base">Activity</CardTitle>
          <p className="text-sm text-muted-foreground">
            {total} recorded {total === 1 ? "action" : "actions"}. Nothing here can be
            edited or removed.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={entityType} onValueChange={setEntityType}>
            <SelectTrigger className="w-40" aria-label="Filter by what was touched">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Everything</SelectItem>
              {filters?.entity_types.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.value.replace(/_/g, " ")} ({option.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={action} onValueChange={setAction}>
            <SelectTrigger className="w-36" aria-label="Filter by action">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Any action</SelectItem>
              {filters?.actions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.value.replace(/_/g, " ")} ({option.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      {isLoading && entries.length === 0 ? (
        <div className="h-40 animate-pulse bg-muted/40" />
      ) : entries.length === 0 ? (
        <p className="flex flex-col items-center gap-2 px-6 py-12 text-center text-sm text-muted-foreground">
          <History className="size-7" aria-hidden="true" />
          Nothing matches those filters.
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
                    <Badge variant={ACTION_TONE(entry.action)} className="mt-0.5 shrink-0 text-xs">
                      {entry.action.replace(/_/g, " ")}
                    </Badge>

                    <div className="min-w-40 flex-1">
                      <p className="text-sm">{entry.summary}</p>
                      <p className="text-xs text-muted-foreground">
                        {/* Removing somebody nulls the link but keeps the
                            history, so an unattributed entry is a real state,
                            not missing data. */}
                        {entry.user?.full_name ?? "a since-removed account"}
                        {" · "}
                        {entry.entity_type.replace(/_/g, " ")}
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
              <Button type="button" variant="outline" onClick={() => setLimit((n) => n + 50)}>
                Show more
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

export default ActivityFeed
