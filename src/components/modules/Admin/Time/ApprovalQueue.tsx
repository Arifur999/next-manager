"use client"

import {
  approveTimeAction,
  unapproveTimeAction,
} from "@/app/(dashboardLayout)/dashboard/timesheet/_action"
import { groupByPerson } from "@/components/modules/Admin/Time/groupByPerson"
import StatTile from "@/components/shared/StatTile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useActionMutation } from "@/hooks/useActionMutation"
import { useQuery } from "@tanstack/react-query"
import { addDays, format, startOfWeek } from "date-fns"
import { ChevronLeft, ChevronRight, Clock, Undo2, UserCheck } from "lucide-react"
import { useState } from "react"
import { timeEntriesListQuery } from "@/queries/work.queries"
import { queryKeys } from "@/lib/queryKeys"

/**
 * Everybody's logged time, waiting on a second pair of eyes.
 *
 * Approval is what turns a logged hour into a billable one, so this screen is
 * the gate every realization figure passes through. The server refuses
 * self-approval; this screen does not hide your own rows, because seeing them
 * sit there unapproved is the point — somebody else has to clear them.
 *
 * Grouped by person, not by date. The decision being made is "does this
 * person's week look right", and a flat chronological list makes the reader
 * reassemble each person's week themselves.
 */

const iso = (date: Date) => format(date, "yyyy-MM-dd")

const weekStart = (offset: number) =>
  startOfWeek(addDays(new Date(), offset * 7), { weekStartsOn: 1 })

const ApprovalQueue = ({ viewerId }: { viewerId: string }) => {
  const [offset, setOffset] = useState(0)
  const [tab, setTab] = useState<"pending" | "approved">("pending")

  const start = weekStart(offset)
  const end = addDays(start, 6)
  const query = `from=${iso(start)}&to=${iso(end)}&approved=${tab === "approved"}`

  const { data, isLoading } = useQuery(timeEntriesListQuery(query))

  const entries = data?.data ?? []
  const groups = groupByPerson(entries)
  const totalHours = entries.reduce((running, entry) => running + entry.hours, 0)
  const billableHours = entries
    .filter((entry) => entry.is_billable)
    .reduce((running, entry) => running + entry.hours, 0)

  const { run: approve, isPending: isApproving } = useActionMutation({
    action: approveTimeAction,
    successMessage: "Approved",
    invalidateKeys: [queryKeys.timeEntries.all, queryKeys.timeSummary.all],
    refresh: false,
  })

  const { run: unapprove, isPending: isUnapproving } = useActionMutation({
    action: unapproveTimeAction,
    successMessage: "Reopened for editing",
    invalidateKeys: [queryKeys.timeEntries.all, queryKeys.timeSummary.all],
    refresh: false,
  })

  const isBusy = isApproving || isUnapproving

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatTile
          label={tab === "pending" ? "Awaiting approval" : "Approved this week"}
          value={`${totalHours.toFixed(2)} h`}
          secondary={`${billableHours.toFixed(2)} h billable`}
          icon={<Clock className="size-5" />}
          tone={1}
        />
        <StatTile
          label="People"
          value={String(groups.length)}
          hint={tab === "pending" ? "With time still to clear" : "With cleared time"}
          icon={<UserCheck className="size-5" />}
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
            <Tabs value={tab} onValueChange={(value) => setTab(value as "pending" | "approved")}>
              <TabsList>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
              </TabsList>
            </Tabs>

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
              disabled={offset >= 0}
            >
              <ChevronRight className="size-4" />
              <span className="sr-only">Next week</span>
            </Button>
          </div>
        </CardHeader>

        {isLoading && entries.length === 0 ? (
          <div className="h-40 animate-pulse bg-muted/40" />
        ) : groups.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-muted-foreground">
            {tab === "pending"
              ? "Nothing waiting. Every hour logged this week has been approved."
              : "Nothing approved for this week yet."}
          </p>
        ) : (
          <div className="divide-y">
            {groups.map((group) => (
              <section key={group.userId}>
                <header className="flex items-center justify-between gap-3 bg-muted/40 px-5 py-2">
                  <p className="text-sm font-medium">
                    {group.name}
                    {group.userId === viewerId && (
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        (you — someone else has to approve these)
                      </span>
                    )}
                  </p>
                  <p className="text-sm font-medium tabular-nums">{group.hours.toFixed(2)} h</p>
                </header>

                <ul className="divide-y">
                  {group.entries.map((entry) => (
                    <li key={entry.id} className="flex items-center justify-between gap-3 px-5 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm">
                          {entry.project?.name ?? "Project"}
                          {entry.task ? ` · ${entry.task.title}` : ""}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {format(new Date(entry.date), "EEE dd MMM")}
                          {entry.notes ? ` · ${entry.notes}` : ""}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        {!entry.is_billable && (
                          <Badge variant="outline" className="text-xs">
                            non-billable
                          </Badge>
                        )}
                        <span className="text-sm font-medium tabular-nums">
                          {entry.hours.toFixed(2)} h
                        </span>

                        {tab === "pending" ? (
                          <Button
                            type="button"
                            size="sm"
                            // The server refuses self-approval, so the button
                            // is off rather than failing after the click.
                            disabled={isBusy || group.userId === viewerId}
                            onClick={() => void approve(entry.id)}
                          >
                            Approve
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={isBusy}
                            onClick={() => void unapprove(entry.id)}
                          >
                            <Undo2 className="size-3.5" />
                            Reopen
                          </Button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

export default ApprovalQueue
