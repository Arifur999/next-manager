import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import type { ITask } from "@/types/work.types"
import { format, isBefore, startOfToday } from "date-fns"

/**
 * One flat list, newest deadline first. A board is for seeing where work is
 * stuck; a list is for working through it, and a column of four late tasks
 * beside three empty columns says nothing.
 */
const TaskList = ({ tasks }: { tasks: ITask[] }) => (
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
)

export default TaskList
