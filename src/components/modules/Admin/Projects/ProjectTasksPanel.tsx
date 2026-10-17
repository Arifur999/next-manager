"use client"

import TaskLink from "@/components/modules/Admin/Tasks/TaskLink"
import TaskSheet from "@/components/modules/Admin/Tasks/TaskSheet"
import { isTaskOverdue } from "@/components/modules/Admin/Tasks/taskDue"
import EmptyState from "@/components/shared/state/EmptyState"
import PanelState from "@/components/shared/state/PanelState"
import StatusBadge from "@/components/shared/status/StatusBadge"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatDayShort } from "@/lib/dates"
import { cn } from "@/lib/utils"
import { tasksListQuery } from "@/queries/work.queries"
import { useQuery } from "@tanstack/react-query"
import { ListChecks } from "lucide-react"

/**
 * The project's tasks, each opening in the same sheet as on the board.
 *
 * `canManage` (admin and the project manager) lets the sheet change and delete
 * them; everyone else reads them here and moves their own from Tasks.
 */
const ProjectTasksPanel = ({ projectId, canManage = false }: { projectId: string; canManage?: boolean }) => {
  const tasksQuery = useQuery(tasksListQuery(`project_id=${projectId}`))

  const tasks = tasksQuery.data?.data ?? []

  // By category: a renamed "Done" still counts as finished, and so does a
  // second finished status the agency added.
  const doneCount = tasks.filter((task) => task.status.category === "done").length
  const progress = tasks.length > 0 ? (doneCount / tasks.length) * 100 : 0

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <CardHeader className="border-b px-5 py-4">
        <CardTitle className="text-base">
          {tasksQuery.isSuccess ? `${doneCount} of ${tasks.length} done` : "Tasks"}
        </CardTitle>
        <Progress value={progress} className="mt-2 h-1.5" />
      </CardHeader>

      <PanelState
        query={tasksQuery}
        errorMessage="The tasks did not load."
        isEmpty={tasks.length === 0}
        empty={<EmptyState icon={ListChecks}>No tasks on this project yet.</EmptyState>}
      >
        <ul className="divide-y">
          {tasks.map((task) => {
            const overdue = isTaskOverdue(task)

            return (
              <li key={task.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <TaskLink taskId={task.id} className="block truncate text-sm font-medium">
                    {task.title}
                  </TaskLink>
                  <p className="truncate text-xs text-muted-foreground">
                    {task.assignee?.full_name ?? "Unassigned"}
                    {task.due_date && (
                      <span className={cn(overdue && "font-medium text-destructive")}>
                        {overdue ? " · overdue " : " · due "}
                        {formatDayShort(task.due_date)}
                      </span>
                    )}
                  </p>
                </div>
                <StatusBadge category={task.status.category} label={task.status.name} className="shrink-0" />
              </li>
            )
          })}
        </ul>
      </PanelState>

      <TaskSheet tasks={tasks} access={canManage ? "manage" : "read"} userId={null} />
    </Card>
  )
}

export default ProjectTasksPanel
