"use client"

import CreateTaskModal from "@/components/modules/Admin/Tasks/CreateTaskModal"
import TaskCalendar from "@/components/modules/Admin/Tasks/TaskCalendar"
import TaskColumns from "@/components/modules/Admin/Tasks/TaskColumns"
import TaskList from "@/components/modules/Admin/Tasks/TaskList"
import EmptyState from "@/components/shared/state/EmptyState"
import ErrorState from "@/components/shared/state/ErrorState"
import LoadingBlock from "@/components/shared/state/LoadingBlock"
import { Card } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import { ListChecks } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { tasksListQuery, workflowStatusesListQuery } from "@/queries/work.queries"

type TaskFilters = {
  mine: boolean
  overdue: boolean
  clientOwner: boolean
  due: string | null
  completed: boolean
}

// Names the view that is empty: "No tasks yet" on a filtered view would be a
// claim about the whole board.
const emptyMessageFor = ({ mine, overdue, clientOwner, due, completed }: TaskFilters) => {
  if (overdue) return "Nothing is late."
  if (due === "today") return "Nothing is due today."
  if (due === "upcoming") return "Nothing due in the next seven days."
  if (completed) return "Nothing finished yet."
  if (mine) return "Nothing assigned to you."
  if (clientOwner) return "No work on the clients you brought in yet."
  return "No tasks yet."
}

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

  const tasksQuery = useQuery(tasksListQuery(query))

  // The columns are the agency's own now, so the board asks for them instead
  // of carrying a list of four words that used to be true.
  const statusesQuery = useQuery(workflowStatusesListQuery("kind=task"))

  const tasks = tasksQuery.data?.data ?? []
  const statuses = ((statusesQuery.data?.data ?? [])).filter(
    // A retired column still holds work, so it is drawn when something is on
    // it - just never offered as somewhere to put anything new.
    (status) => status.is_active || tasks.some((task) => task.status.id === status.id)
  )

  const renderTasks = () => {
    if (!tasksQuery.data && tasksQuery.isError) {
      return (
        <Card>
          <ErrorState
            message="The tasks did not load."
            onRetry={() => void tasksQuery.refetch()}
            isRetrying={tasksQuery.isFetching}
          />
        </Card>
      )
    }

    if (tasksQuery.isLoading && tasks.length === 0) {
      return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {(statuses.length > 0 ? statuses : [null, null, null, null]).map((column, index) => (
            <Card key={column?.id ?? index} className="overflow-hidden p-0">
              <LoadingBlock height="h-48" />
            </Card>
          ))}
        </div>
      )
    }

    if (tasks.length === 0) {
      return (
        <Card>
          <EmptyState icon={ListChecks}>
            {emptyMessageFor({ mine, overdue, clientOwner, due, completed })}
          </EmptyState>
        </Card>
      )
    }

    // What lands this week, rather than where work is stuck: a third view over
    // the same query, not a different screen.
    if (asCalendar) return <TaskCalendar tasks={tasks} />
    if (asList) return <TaskList tasks={tasks} />

    // Without its columns the board would draw nothing, tasks and all.
    if (!statusesQuery.data && statusesQuery.isError) {
      return (
        <Card>
          <ErrorState
            message="The board's columns did not load."
            onRetry={() => void statusesQuery.refetch()}
            isRetrying={statusesQuery.isFetching}
          />
        </Card>
      )
    }

    return <TaskColumns tasks={tasks} statuses={statuses} />
  }

  return (
    <div className="space-y-4">
      {canManage && !mine && !overdue && !clientOwner && !due && !completed && (
        <div className="flex justify-end">
          <CreateTaskModal />
        </div>
      )}

      {renderTasks()}
    </div>
  )
}

export default TaskBoard
