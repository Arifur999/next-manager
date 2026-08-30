"use client"

import { updateTaskAction } from "@/app/(dashboardLayout)/admin/dashboard/tasks/_action"
import { Checkbox } from "@/components/ui/checkbox"
import type { ITask, IWorkflowStatus } from "@/types/agencio.types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { format, isBefore, startOfToday } from "date-fns"
import { toast } from "sonner"

const PRIORITY_TONE: Record<string, string> = {
  urgent: "bg-destructive/12 text-destructive",
  high: "bg-chart-2/15 text-chart-2",
  medium: "bg-chart-3/15 text-chart-3",
  low: "bg-muted text-muted-foreground",
}

const TaskCard = ({ task, statuses }: { task: ITask; statuses: IWorkflowStatus[] }) => {
  const queryClient = useQueryClient()

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (status_id: string) => updateTaskAction(task.id, { status_id }),
  })

  // Finished is a category, so a column called "Shipped" strikes the title
  // through exactly like the "Done" it replaced.
  const isDone = task.status.category === "done"

  const overdue =
    task.due_date && !isDone ? isBefore(new Date(task.due_date), startOfToday()) : false

  // Ticking the box has to land on a real column, and which one depends on
  // the board rather than on a word: the first finished status to close it,
  // the board's own default to reopen it.
  const closeTarget = statuses.find((status) => status.category === "done" && status.is_active)
  const reopenTarget =
    statuses.find((status) => status.is_default && status.is_active) ??
    statuses.find((status) => status.category === "open" && status.is_active)

  const toggleDone = async () => {
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

    const result = await mutateAsync(next.id)

    if (!result.success) {
      toast.error(result.message || "Failed to update task")
      return
    }

    void queryClient.invalidateQueries({ queryKey: ["tasks"] })
    void queryClient.invalidateQueries({ queryKey: ["dashboard"] })
  }

  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex items-start gap-2.5">
        <Checkbox
          checked={isDone}
          onCheckedChange={() => void toggleDone()}
          disabled={isPending}
          aria-label={isDone ? `Reopen ${task.title}` : `Mark ${task.title} done`}
          className="mt-0.5"
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
            <span
              className={`rounded px-1.5 py-0.5 text-[11px] font-medium capitalize ${
                PRIORITY_TONE[task.priority]
              }`}
            >
              {task.priority}
            </span>
            {task.due_date && (
              <span
                className={`text-[11px] ${
                  overdue ? "font-medium text-destructive" : "text-muted-foreground"
                }`}
              >
                {overdue ? "overdue · " : "due "}
                {format(new Date(task.due_date), "MMM dd")}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Tasks, in four views over one query.
 *
 * Board, List, Overdue and My Tasks are sidebar entries pointing at this same
 * component with a different URL. Four pages would be four places to fix the
 * same bug, and the sidebar looks identical either way.
 *
 * Overdue is filtered on the SERVER, not here: the list is paginated, so
 * filtering whatever page arrived would hide late work rather than find it.
 */

export default TaskCard
