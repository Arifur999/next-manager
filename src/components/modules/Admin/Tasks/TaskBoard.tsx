"use client"

import CreateTaskModal from "@/components/modules/Admin/Tasks/CreateTaskModal"
import TaskCalendar from "@/components/modules/Admin/Tasks/TaskCalendar"
import TaskCard from "@/components/modules/Admin/Tasks/TaskCard"
import EmptyState from "@/components/shared/state/EmptyState"
import LoadingBlock from "@/components/shared/state/LoadingBlock"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { getTasks, getWorkflowStatuses } from "@/services/agencio.services"
import type { ITask, IWorkflowStatus } from "@/types/agencio.types"
import { useQuery } from "@tanstack/react-query"
import { format, isBefore, startOfToday } from "date-fns"
import { ListChecks } from "lucide-react"
import { useSearchParams } from "next/navigation"

/**
 * The task board.
 *
 * `canManage` decides whether this is a board somebody works from or one they
 * only read. Sales gets the second: they open it to see where a client they
 * brought in has got to, and the API refuses them every write behind it, so
 * offering a create button would only teach them the app is broken.
 */
const TaskBoard = ({
  mineOnly = false,
  canManage = true,
}: {
  mineOnly?: boolean
  canManage?: boolean
}) => {
  const searchParams = useSearchParams()

  const mine = mineOnly || searchParams.get("mine") === "true"
  const overdue = searchParams.get("overdue") === "true"
  // Every task inside work this person brought in, whoever is doing it. The
  // server resolves it as project -> client -> owner and accepts only the
  // literal "me", so it can never be pointed at somebody else's book.
  const clientOwner = searchParams.get("client_owner") === "me"
  // The My Work views. "upcoming" is a seven-day window, decided on the server
  // so the sidebar and the query cannot disagree about how far ahead it looks.
  const due = searchParams.get("due")
  const completed = searchParams.get("completed") === "true"
  const view = searchParams.get("view")
  // Overdue forces the list: a board with four late tasks in one column and
  // three empty ones beside it says nothing.
  const asList = view === "list" || overdue || due !== null || completed
  const asCalendar = view === "calendar" && !overdue

  const query = [
    mine ? "mine=true" : "",
    overdue ? "overdue=true" : "",
    clientOwner ? "client_owner=me" : "",
    due === "today" || due === "upcoming" ? `due=${due}` : "",
    completed ? "completed=true" : "",
  ]
    .filter(Boolean)
    .join("&")

  const { data, isLoading } = useQuery({
    queryKey: ["tasks", query],
    queryFn: () => getTasks(query || undefined),
  })

  // The columns are the agency's own now, so the board asks for them instead
  // of carrying a list of four words that used to be true.
  const { data: statusData } = useQuery({
    queryKey: ["workflow-statuses", "task"],
    queryFn: () => getWorkflowStatuses("kind=task"),
  })

  const tasks = (data?.data ?? []) as ITask[]
  const statuses = ((statusData?.data ?? []) as IWorkflowStatus[]).filter(
    // A retired column still holds work, so it is drawn when something is on
    // it - just never offered as somewhere to put anything new.
    (status) => status.is_active || tasks.some((task) => task.status.id === status.id)
  )

  const empty = overdue
    ? "Nothing is late."
    : due === "today"
      ? "Nothing is due today."
      : due === "upcoming"
        ? "Nothing due in the next seven days."
        : completed
          ? "Nothing finished yet."
    : mine
      ? "Nothing assigned to you."
      : clientOwner
        ? "No work on the clients you brought in yet."
        : "No tasks yet."

  return (
    <div className="space-y-4">
      {canManage && !mine && !overdue && !clientOwner && !due && !completed && (
        <div className="flex justify-end">
          <CreateTaskModal />
        </div>
      )}

      {isLoading && tasks.length === 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {(statuses.length > 0 ? statuses : [null, null, null, null]).map((column, index) => (
            <Card key={column?.id ?? index} className="overflow-hidden p-0">
              <LoadingBlock height="h-48" />
            </Card>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <Card>
          <EmptyState icon={ListChecks}>{empty}</EmptyState>
        </Card>
      ) : asCalendar ? (
        // What lands this week, rather than where work is stuck. A third
        // view over the same query, not a different screen.
        <TaskCalendar tasks={tasks} />
      ) : asList ? (
        // One flat list, newest deadline first. A board is for seeing where
        // work is stuck; a list is for working through it, and a column of
        // four late tasks beside three empty columns says nothing.
        <Card className="gap-0 overflow-hidden p-0">
          <ul className="divide-y">
            {tasks.map((task) => (
              <li key={task.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <div className="min-w-48 flex-1">
                  <p className="font-medium">{task.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {task.project?.name ?? "No project"}
                    {task.assignee ? ` · ${task.assignee.full_name}` : " · unassigned"}
                  </p>
                </div>

                <Badge variant="outline">{task.status.name}</Badge>

                {task.due_date && (
                  <span
                    className={
                      isBefore(new Date(task.due_date), startOfToday()) &&
                      task.status.category !== "done"
                        ? "text-sm font-medium"
                        : "text-sm text-muted-foreground"
                    }
                  >
                    {format(new Date(task.due_date), "d MMM")}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statuses.map((column) => {
            const columnTasks = tasks.filter((task) => task.status.id === column.id)

            return (
              <Card key={column.id} className="gap-0 overflow-hidden p-0">
                <CardHeader className="flex flex-row items-center justify-between border-b px-4 py-3">
                  <CardTitle className="text-sm">
                    {column.name}
                    {!column.is_active && (
                      <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                        (off)
                      </span>
                    )}
                  </CardTitle>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {columnTasks.length}
                  </span>
                </CardHeader>

                <div className="space-y-2 p-3">
                  {columnTasks.length === 0 ? (
                    <p className="py-6 text-center text-xs text-muted-foreground">Empty</p>
                  ) : (
                    columnTasks.map((task) => (
                      <TaskCard key={task.id} task={task} statuses={statuses} />
                    ))
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default TaskBoard
