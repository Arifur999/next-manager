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
import {
  emptyMessageFor,
  isNarrowed,
  readsAsList,
  readTaskView,
  taskQueryString,
} from "@/components/modules/Admin/Tasks/taskView"
import { tasksListQuery, workflowStatusesListQuery } from "@/queries/work.queries"

/**
 * The task board, and every other view of tasks over the same query.
 *
 * Board, List, Review, Overdue, Unassigned and Mine are view tabs pointing at
 * this one component with a different URL: six pages would be six places to
 * fix the same bug. Every filter is applied on the SERVER, not here: filtering
 * whatever page arrived would hide late work rather than find it.
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

  const view = readTaskView(searchParams, { mineOnly })
  const layout = searchParams.get("view")
  const asList = layout === "list" || readsAsList(view)
  // What lands this week, rather than where work is stuck: a third view over
  // the same query, not a different screen.
  const asCalendar = layout === "calendar" && !asList

  const tasksQuery = useQuery(tasksListQuery(taskQueryString(view)))

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
            {emptyMessageFor(view)}
          </EmptyState>
        </Card>
      )
    }

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
      {canManage && !isNarrowed(view) && (
        <div className="flex justify-end">
          <CreateTaskModal />
        </div>
      )}

      {renderTasks()}
    </div>
  )
}

export default TaskBoard
