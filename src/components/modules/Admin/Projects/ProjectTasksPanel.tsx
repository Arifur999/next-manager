"use client"

import { STATUS_TONE } from "@/components/shared/status/statusTone"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { tasksListQuery } from "@/queries/work.queries"

const ProjectTasksPanel = ({ projectId }: { projectId: string }) => {
  const { data: tasksData } = useQuery(tasksListQuery(`project_id=${projectId}`))

  const tasks = tasksData?.data ?? []

  // By category: a renamed "Done" still counts as finished, and so does a
  // second finished status the agency added.
  const doneCount = tasks.filter((task) => task.status.category === "done").length
  const progress = tasks.length > 0 ? (doneCount / tasks.length) * 100 : 0

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <CardHeader className="border-b px-5 py-4">
        <CardTitle className="text-base">
          {doneCount} of {tasks.length} done
        </CardTitle>
        <Progress value={progress} className="mt-2 h-1.5" />
      </CardHeader>

      {tasks.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-muted-foreground">
          No tasks on this project yet.
        </p>
      ) : (
        <ul className="divide-y">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{task.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {task.assignee?.full_name ?? "Unassigned"}
                  {task.due_date && ` · due ${format(new Date(task.due_date), "MMM dd")}`}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium capitalize ${
                  STATUS_TONE[task.status.category]
                }`}
              >
                {task.status.name}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

export default ProjectTasksPanel
