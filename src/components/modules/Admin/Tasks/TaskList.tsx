import TaskPriorityBadge from "@/components/modules/Admin/Tasks/TaskPriorityBadge"
import { isTaskOverdue } from "@/components/modules/Admin/Tasks/taskDue"
import StatusBadge from "@/components/shared/status/StatusBadge"
import { Card } from "@/components/ui/card"
import { formatDayShort } from "@/lib/dates"
import { cn } from "@/lib/utils"
import type { ITask } from "@/types/work.types"

/**
 * One flat list, in the order the API sends it: board order, then soonest
 * deadline. A board is for seeing where work is stuck; a list is for working
 * through it, and a column of four late tasks beside three empty columns says
 * nothing.
 */
const TaskList = ({ tasks }: { tasks: ITask[] }) => (
  <Card className="gap-0 overflow-hidden p-0">
    <ul className="divide-y">
      {tasks.map((task) => {
        const overdue = isTaskOverdue(task)

        return (
          <li key={task.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <div className="min-w-48 flex-1">
              <p className="font-medium">{task.title}</p>
              <p className="text-xs text-muted-foreground">
                {task.project?.name ?? "No project"}
                {task.assignee ? ` · ${task.assignee.full_name}` : " · unassigned"}
              </p>
            </div>

            <TaskPriorityBadge priority={task.priority} />
            <StatusBadge category={task.status.category} label={task.status.name} />

            {task.due_date && (
              <span
                className={cn("text-sm tabular-nums", overdue ? "font-medium text-destructive" : "text-muted-foreground")}
              >
                {overdue ? "overdue · " : ""}
                {formatDayShort(task.due_date)}
              </span>
            )}
          </li>
        )
      })}
    </ul>
  </Card>
)

export default TaskList
