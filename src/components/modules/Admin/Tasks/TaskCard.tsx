"use client"

import { moveTaskAction } from "@/app/(dashboardLayout)/admin/dashboard/tasks/_action"
import { Checkbox } from "@/components/ui/checkbox"
import { useActionMutation } from "@/hooks/useActionMutation"
import TaskPriorityBadge from "@/components/modules/Admin/Tasks/TaskPriorityBadge"
import { isTaskOverdue } from "@/components/modules/Admin/Tasks/taskDue"
import { formatDayShort } from "@/lib/dates"
import type { ITask, IWorkflowStatus } from "@/types/work.types"
import { toast } from "sonner"
import { queryKeys } from "@/lib/queryKeys"

const TaskCard = ({ task, statuses }: { task: ITask; statuses: IWorkflowStatus[] }) => {
  // The ticked box and the card's new column are the confirmation.
  const { run: moveTask, isPending } = useActionMutation({
    action: (statusId: string) => moveTaskAction(task.id, { status_id: statusId }),
    successMessage: false,
    invalidateKeys: [queryKeys.tasks.all, queryKeys.dashboard.all],
    refresh: false,
  })

  // Finished is a category, so a column called "Shipped" strikes the title
  // through exactly like the "Done" it replaced.
  const isDone = task.status.category === "done"

  const overdue = isTaskOverdue(task)

  // Ticking the box has to land on a real column, and which one depends on
  // the board rather than on a word: the first finished status to close it,
  // the board's own default to reopen it.
  const closeTarget = statuses.find((status) => status.category === "done" && status.is_active)
  const reopenTarget =
    statuses.find((status) => status.is_default && status.is_active) ??
    statuses.find((status) => status.category === "open" && status.is_active)

  const toggleDone = () => {
    const next = isDone ? reopenTarget : closeTarget

    if (!next) {
      // Said rather than silently doing nothing: the board has no column to
      // move it to, which is a board-setup problem, not a click problem.
      toast.error(
        isDone
          ? "This board has nothing to reopen work into."
          : "This board has no finished column to move it to."
      )
      return
    }

    void moveTask(next.id)
  }

  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex items-start gap-2.5">
        <Checkbox
          checked={isDone}
          onCheckedChange={toggleDone}
          disabled={isPending}
          aria-label={isDone ? `Reopen ${task.title}` : `Mark ${task.title} done`}
          // 24px to see and hit; below md the pseudo-element stretches the
          // target to 44px for a thumb without moving the layout.
          className="size-6 after:-inset-2.5 md:after:-inset-1"
        />

        <div className="min-w-0 flex-1">
          <p
            className={`text-sm ${
              isDone ? "text-muted-foreground line-through" : "font-medium"
            }`}
          >
            {task.title}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {task.project?.code ?? "No project"}
            {task.assignee ? ` · ${task.assignee.full_name}` : " · unassigned"}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <TaskPriorityBadge priority={task.priority} />
            {task.due_date && (
              <span
                className={`text-[11px] ${
                  overdue ? "font-medium text-destructive" : "text-muted-foreground"
                }`}
              >
                {overdue ? "overdue · " : "due "}
                {formatDayShort(task.due_date)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaskCard
