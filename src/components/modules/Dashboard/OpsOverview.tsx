"use client"

import CountSection from "@/components/shared/dashboard/CountSection"
import { useCount } from "@/components/shared/dashboard/useCount"
import EmptyState from "@/components/shared/state/EmptyState"
import { STATUS_TONE } from "@/components/shared/status/statusTone"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { getProjects, getTasks } from "@/services/agencio.services"
import type { ITask } from "@/types/agencio.types"
import { useQuery } from "@tanstack/react-query"
import { AlertTriangle, CalendarCheck, CheckCircle2, FolderKanban, ListChecks } from "lucide-react"
import Link from "next/link"

/**
 * What somebody doing the work opens the morning with.
 *
 * One question — what do I need to do — answered four ways, and then the list
 * itself. The counts are the same filters the My Work sidebar carries, read
 * from the same endpoint, so a tile and the page it links to cannot disagree.
 *
 * Everything here is already narrowed by the API to this person's own work; the
 * `mine=true` in each query says so anyway, because a screen titled "my" whose
 * query does not say "mine" is how a scope quietly stops being one.
 */
const OpsOverview = () => {
  const mine = useCount(["tasks", "count", "mine"], () => getTasks("mine=true&limit=1"))
  const today = useCount(["tasks", "count", "today"], () =>
    getTasks("mine=true&due=today&limit=1")
  )
  const overdue = useCount(["tasks", "count", "overdue"], () =>
    getTasks("mine=true&overdue=true&limit=1")
  )
  const done = useCount(["tasks", "count", "done"], () =>
    getTasks("mine=true&completed=true&limit=1")
  )
  const projects = useCount(["projects", "count", "mine"], () => getProjects("mine=true&limit=1"))

  // Today's work itself, not a count of it: this is the list somebody actually
  // works from, and the number above only tells them how long it is.
  const { data: todayData } = useQuery({
    queryKey: ["tasks", "mine=true&due=today"],
    queryFn: () => getTasks("mine=true&due=today"),
  })
  const todaysWork = (todayData?.data ?? []) as ITask[]

  return (
    <div className="space-y-6">
      <CountSection
        title="My work"
        counts={[
          {
            label: "My tasks",
            value: mine,
            href: "/dashboard/tasks",
            icon: <ListChecks className="size-5" />,
            tone: 1,
          },
          {
            label: "Due today",
            value: today,
            href: "/dashboard/tasks?due=today",
            icon: <CalendarCheck className="size-5" />,
            tone: 2,
          },
          {
            label: "Overdue",
            value: overdue,
            href: "/dashboard/tasks?overdue=true",
            hint: "Past their date and still open",
            icon: <AlertTriangle className="size-5" />,
            tone: 4,
          },
          {
            label: "Completed",
            value: done,
            href: "/dashboard/tasks?completed=true",
            icon: <CheckCircle2 className="size-5" />,
            tone: 3,
          },
        ]}
      />

      <CountSection
        title="My projects"
        counts={[
          {
            label: "Projects I am on",
            value: projects,
            href: "/admin/dashboard/projects?mine=true",
            hint: "Only the ones you are a member of",
            icon: <FolderKanban className="size-5" />,
            tone: 1,
          },
        ]}
      />

      <Card className="gap-0 overflow-hidden p-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle className="text-base">Today&apos;s work</CardTitle>
          <p className="text-sm text-muted-foreground">
            Everything you owe today. A task with no date is not on this list — it has not
            been promised for a day.
          </p>
        </CardHeader>

        {todaysWork.length === 0 ? (
          <EmptyState icon={CalendarCheck}>Nothing is due today.</EmptyState>
        ) : (
          <ul className="divide-y">
            {todaysWork.map((task) => (
              <li
                key={task.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
              >
                <div className="min-w-48 flex-1">
                  <p className="font-medium">{task.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {task.project?.name ?? "No project"}
                  </p>
                </div>

                <span
                  className={cn(
                    "rounded px-2 py-0.5 text-xs",
                    STATUS_TONE[task.status?.category ?? "open"]
                  )}
                >
                  {task.status?.name ?? "No status"}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="border-t px-5 py-3">
          <Link href="/dashboard/tasks" className="text-sm text-muted-foreground hover:underline">
            All of your work →
          </Link>
        </div>
      </Card>
    </div>
  )
}

export default OpsOverview
