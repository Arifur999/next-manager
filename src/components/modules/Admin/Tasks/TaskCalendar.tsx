"use client"

import TaskLink from "@/components/modules/Admin/Tasks/TaskLink"
import MonthGrid from "@/components/shared/calendar/MonthGrid"
import { STATUS_TONE } from "@/components/shared/status/statusTone"
import { cn } from "@/lib/utils"
import type { ITask } from "@/types/work.types"
import { isTaskOverdue } from "@/components/modules/Admin/Tasks/taskDue"
import { toDate } from "@/lib/dates"
import { plural } from "@/lib/text"
import { startOfToday } from "date-fns"

/**
 * Tasks by the day they are due.
 *
 * A board answers "where is work stuck"; a calendar answers "what lands this
 * week", which is the question a project manager opens Monday with. Neither
 * replaces the other, so this is a third view over the same query rather than a
 * different screen.
 *
 * A task with no due date is left OFF rather than piled onto today. It has not
 * been promised for a day, and putting it on one would invent a deadline the
 * person doing it never agreed to — the count below says how many are missing
 * so they are not simply lost.
 */
const TaskCalendar = ({ tasks }: { tasks: ITask[] }) => {
  const today = startOfToday()
  const undated = tasks.filter((task) => !task.due_date).length

  return (
    <div className="space-y-3">
      <MonthGrid
        items={tasks}
        dateOf={(task) => (task.due_date ? toDate(task.due_date) : null)}
        emptyLabel="Nothing is due this month."
        renderItem={(task) => {
          const overdue = isTaskOverdue(task, today)

          return (
            <TaskLink
              taskId={task.id}
              className={cn(
                "block truncate rounded px-1.5 py-0.5 text-[11px]",
                overdue ? "bg-destructive-subtle text-destructive-subtle-foreground" : STATUS_TONE[task.status.category],
              )}
            >
              <span title={`${task.title}${task.assignee ? ` · ${task.assignee.full_name}` : ""}`}>{task.title}</span>
            </TaskLink>
          )
        }}
      />

      {undated > 0 && (
        <p className="text-xs text-muted-foreground">
          {plural(undated, "task has", "tasks have")} no due date, so {undated === 1 ? "it is" : "they are"}{" "}
          not on the calendar. A task without a date has not been promised for a day.
        </p>
      )}
    </div>
  )
}

export default TaskCalendar
