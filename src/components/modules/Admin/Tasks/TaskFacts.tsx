import TaskPriorityBadge from "@/components/modules/Admin/Tasks/TaskPriorityBadge"
import { isTaskOverdue } from "@/components/modules/Admin/Tasks/taskDue"
import StatusBadge from "@/components/shared/status/StatusBadge"
import { formatDay } from "@/lib/dates"
import type { ITask } from "@/types/work.types"
import type { ReactNode } from "react"

const Fact = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex items-center gap-3">
    <dt className="w-24 shrink-0 text-muted-foreground">{label}</dt>
    <dd className="min-w-0">{children}</dd>
  </div>
)

/** A task's facts as text, for the parts of it the reader cannot change. */
const TaskFacts = ({ task, withStatus = false }: { task: ITask; withStatus?: boolean }) => {
  const overdue = isTaskOverdue(task)

  return (
    <dl className="space-y-2.5 text-sm">
      {withStatus && (
        <Fact label="Status">
          <StatusBadge category={task.status.category} label={task.status.name} />
        </Fact>
      )}
      <Fact label="Assignee">{task.assignee?.full_name ?? "Nobody yet"}</Fact>
      <Fact label="Priority">
        <TaskPriorityBadge priority={task.priority} />
      </Fact>
      <Fact label="Due">
        {task.due_date ? (
          <span className={overdue ? "font-medium text-destructive" : undefined}>
            {formatDay(task.due_date)}
            {overdue && " · overdue"}
          </span>
        ) : (
          <span className="text-muted-foreground">No due date</span>
        )}
      </Fact>
    </dl>
  )
}

export default TaskFacts
