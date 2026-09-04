"use client"

import CountSection from "@/components/shared/dashboard/CountSection"
import { useCount } from "@/components/shared/dashboard/useCount"
import EmptyState from "@/components/shared/state/EmptyState"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { getProjects, getTaskReport, getWorkload } from "@/services/agencio.services"
import type { IProject, ITaskReport, IWorkload } from "@/types/agencio.types"
import { useQuery } from "@tanstack/react-query"
import { format, isBefore, parseISO, startOfToday } from "date-fns"
import { AlertTriangle, CalendarDays, CheckCircle2, FolderKanban, ListChecks, UserCheck, UsersRound } from "lucide-react"
import Link from "next/link"

/**
 * What a project manager opens the morning with.
 *
 * Projects, tasks, and who has room — the three questions delivery is run on.
 * Every count links to the board it was read from, so "four in review" is one
 * click from which four.
 *
 * The status counts are matched by NAME, the same way the sidebar filters are,
 * because a status id differs per agency and a category cannot tell Active from
 * Review — both are `active`. An agency that renames a column sees that tile
 * read zero until the name is changed here too, which is the honest trade and
 * the same one the sidebar already makes.
 */
const PmOverview = () => {
  const planning = useCount(["projects", "count", "planning"], () =>
    getProjects("status=Planning&limit=1")
  )
  const active = useCount(["projects", "count", "active"], () =>
    getProjects("status=Active&limit=1")
  )
  const review = useCount(["projects", "count", "review"], () =>
    getProjects("status=Review&limit=1")
  )
  const completed = useCount(["projects", "count", "completed"], () =>
    getProjects("status=Completed&limit=1")
  )

  const { data: reportData } = useQuery({
    queryKey: ["task-report"],
    queryFn: () => getTaskReport(),
  })
  const report = reportData?.data as ITaskReport | undefined

  const { data: workloadData } = useQuery({ queryKey: ["workload"], queryFn: () => getWorkload() })
  const workload = workloadData?.data as IWorkload | undefined

  // Three readings of one row, from the query the Workload page uses. Somebody
  // with hours to spare, somebody near the line, somebody past it.
  const rows = workload?.rows ?? []
  const available = workload ? rows.filter((row) => row.remaining_hours > 4).length : undefined
  const busy = workload
    ? rows.filter((row) => row.remaining_hours <= 4 && row.remaining_hours >= 0).length
    : undefined
  const overloaded = workload ? rows.filter((row) => row.remaining_hours < 0).length : undefined

  // The deadlines themselves, not a count of them: a date is something to act
  // on, and "three due soon" tells nobody which three.
  const { data: dueData } = useQuery({
    queryKey: ["projects", "deadlines"],
    queryFn: () => getProjects("status=Active&limit=50"),
  })
  const today = startOfToday()
  const deadlines = ((dueData?.data ?? []) as IProject[])
    .filter((project) => project.end_date)
    .sort((a, b) => parseISO(a.end_date!).getTime() - parseISO(b.end_date!).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <CountSection
        title="Project overview"
        counts={[
          {
            label: "Planning",
            value: planning,
            href: "/admin/dashboard/projects?status=Planning",
            icon: <FolderKanban className="size-5" />,
            tone: 2,
          },
          {
            label: "Active",
            value: active,
            href: "/admin/dashboard/projects?status=Active",
            icon: <FolderKanban className="size-5" />,
            tone: 1,
          },
          {
            label: "In review",
            value: review,
            href: "/admin/dashboard/projects?status=Review",
            hint: "Done, not signed off",
            icon: <UserCheck className="size-5" />,
            tone: 4,
          },
          {
            label: "Completed",
            value: completed,
            href: "/admin/dashboard/projects?status=Completed",
            icon: <CheckCircle2 className="size-5" />,
            tone: 3,
          },
        ]}
      />

      <CountSection
        title="Task overview"
        counts={[
          {
            label: "All tasks",
            value: report?.total,
            href: "/admin/dashboard/tasks",
            icon: <ListChecks className="size-5" />,
            tone: 1,
          },
          {
            label: "In review",
            value: report?.by_status.find((row) => row.status?.name === "In review")?.count,
            href: "/admin/dashboard/tasks?status=In review",
            icon: <UserCheck className="size-5" />,
            tone: 2,
          },
          {
            label: "Overdue",
            value: report?.overdue_count,
            href: "/admin/dashboard/tasks?overdue=true",
            icon: <AlertTriangle className="size-5" />,
            tone: 4,
          },
          {
            label: "Finished",
            value: report?.done_count,
            href: "/admin/dashboard/reports/tasks",
            hint: "Read by what a status means, not its name",
            icon: <CheckCircle2 className="size-5" />,
            tone: 3,
          },
        ]}
      />

      <CountSection
        title="Team workload"
        counts={[
          {
            label: "Have room",
            value: available,
            href: "/admin/dashboard/availability",
            hint: "More than four hours left",
            icon: <UsersRound className="size-5" />,
            tone: 3,
          },
          {
            label: "Nearly full",
            value: busy,
            href: "/admin/dashboard/workload",
            icon: <UsersRound className="size-5" />,
            tone: 2,
          },
          {
            label: "Overloaded",
            value: overloaded,
            href: "/admin/dashboard/workload",
            hint: "More logged than they had hours for",
            icon: <UsersRound className="size-5" />,
            tone: 5,
          },
          {
            label: "Unassigned tasks",
            value: report?.unassigned_count,
            href: "/admin/dashboard/tasks",
            hint: "Nobody is doing these",
            icon: <ListChecks className="size-5" />,
            tone: 4,
          },
        ]}
      />

      <Card className="gap-0 overflow-hidden p-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle className="text-base">Project deadlines</CardTitle>
          <p className="text-sm text-muted-foreground">
            Active projects with an end date, soonest first.
          </p>
        </CardHeader>

        {deadlines.length === 0 ? (
          <EmptyState icon={CalendarDays}>No active project has an end date.</EmptyState>
        ) : (
          <ul className="divide-y">
            {deadlines.map((project) => {
              const due = parseISO(project.end_date!)
              const late = isBefore(due, today)

              return (
                <li key={project.id}>
                  <Link
                    href={`/admin/dashboard/projects/${project.id}`}
                    className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{project.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {project.client?.name ?? project.code}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 text-xs tabular-nums ${
                        late ? "text-destructive" : "text-muted-foreground"
                      }`}
                    >
                      {format(due, "d MMM yyyy")}
                      {late ? " · late" : ""}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </div>
  )
}

export default PmOverview
