"use client"

import {
  approveTimeAction,
  unapproveTimeAction,
} from "@/app/(dashboardLayout)/dashboard/timesheet/_action"
import StatTile from "@/components/shared/StatTile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getTimeEntries } from "@/services/agencio.services"
import type { ITimeEntry } from "@/types/agencio.types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { addDays, format, startOfWeek } from "date-fns"
import { ChevronLeft, ChevronRight, Clock, Undo2, UserCheck } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

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

type Group = {
  userId: string
  name: string
  entries: ITimeEntry[]
  hours: number
}

const groupByPerson = (entries: ITimeEntry[]): Group[] => {
  const groups = new Map<string, Group>()

  for (const entry of entries) {
    const userId = entry.user?.id ?? entry.user_id
    const existing = groups.get(userId)

    if (existing) {
      existing.entries.push(entry)
      existing.hours += entry.hours
      continue
    }

    groups.set(userId, {
      userId,
      name: entry.user?.full_name ?? "Unknown",
      entries: [entry],
      hours: entry.hours,
    })
  }

  // Biggest week first: the person with 46 logged hours is the one worth
  // looking at before the person with 4.
  return [...groups.values()].sort((a, b) => b.hours - a.hours)
}

const ApprovalQueue = ({ viewerId }: { viewerId: string }) => {
  const [offset, setOffset] = useState(0)
  const [tab, setTab] = useState<"pending" | "approved">("pending")
  const queryClient = useQueryClient()

  const start = weekStart(offset)
  const end = addDays(start, 6)
  const query = `from=${iso(start)}&to=${iso(end)}&approved=${tab === "approved"}`

  const { data, isLoading } = useQuery({
    queryKey: ["time-entries", query],
    queryFn: () => getTimeEntries(query),
  })

  const entries = (data?.data ?? []) as ITimeEntry[]
  const groups = groupByPerson(entries)
  const totalHours = entries.reduce((running, entry) => running + entry.hours, 0)
  const billableHours = entries
    .filter((entry) => entry.is_billable)
    .reduce((running, entry) => running + entry.hours, 0)

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["time-entries"] })
    void queryClient.invalidateQueries({ queryKey: ["time-summary"] })
  }

  const { mutate: approve, isPending: isApproving } = useMutation({
    mutationFn: (id: string) => approveTimeAction(id),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message || "Failed to approve")
        return
      }
      toast.success("Approved")
      refresh()
    },
  })

  const { mutate: unapprove, isPending: isUnapproving } = useMutation({
    mutationFn: (id: string) => unapproveTimeAction(id),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message || "Failed to reopen")
        return
      }
      toast.success("Reopened for editing")
      refresh()
    },
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
                            onClick={() => approve(entry.id)}
                          >
                            Approve
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={isBusy}
                            onClick={() => unapprove(entry.id)}
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
