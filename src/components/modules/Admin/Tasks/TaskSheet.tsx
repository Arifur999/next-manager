"use client"

import DeleteTaskDialog from "@/components/modules/Admin/Tasks/DeleteTaskDialog"
import TaskEditForm from "@/components/modules/Admin/Tasks/TaskEditForm"
import TaskFacts from "@/components/modules/Admin/Tasks/TaskFacts"
import TaskPriorityBadge from "@/components/modules/Admin/Tasks/TaskPriorityBadge"
import { canEditTask, type TaskAccess } from "@/components/modules/Admin/Tasks/taskAccess"
import { closeTaskSheet, TASK_PARAM } from "@/components/modules/Admin/Tasks/taskSheetUrl"
import ErrorState from "@/components/shared/state/ErrorState"
import LoadingBlock from "@/components/shared/state/LoadingBlock"
import StatusBadge from "@/components/shared/status/StatusBadge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { tasksListQuery } from "@/queries/work.queries"
import type { ITask } from "@/types/work.types"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"

type TaskSheetProps = {
  /** The tasks this page already holds; the open task is looked up here first. */
  tasks: ITask[]
  access: TaskAccess
  userId: string | null
}

// Says why there is no form, so a read-only sheet does not look broken.
const readOnlyReason = (access: TaskAccess) =>
  access === "own"
    ? "Only the person it is assigned to, or a project manager, changes this task."
    : "You can follow this task; an admin or a project manager changes it."

const TaskSheetBody = ({ task, access, userId }: { task: ITask; access: TaskAccess; userId: string | null }) => {
  const editable = canEditTask(access, task, userId)

  return (
    <>
      <SheetHeader className="gap-2 border-b pr-14">
        <SheetTitle className="text-lg leading-snug">{task.title}</SheetTitle>
        <SheetDescription>
          {task.project ? `${task.project.name} · ${task.project.code}` : "No project"}
        </SheetDescription>
        <div className="flex flex-wrap items-center gap-1.5">
          <StatusBadge category={task.status.category} label={task.status.name} />
          <TaskPriorityBadge priority={task.priority} />
        </div>
      </SheetHeader>

      <ScrollArea className="min-h-0 flex-1">
        <div className="p-6">
          {editable ? (
            <TaskEditForm
              task={task}
              scope={access === "manage" ? "all" : "own"}
              onSaved={closeTaskSheet}
              secondaryAction={access === "manage" ? <DeleteTaskDialog task={task} /> : undefined}
            />
          ) : (
            <div className="space-y-5">
              <TaskFacts task={task} withStatus />
              <p className="text-sm whitespace-pre-wrap">
                {task.description || <span className="text-muted-foreground">No description.</span>}
              </p>
              <p className="border-t pt-4 text-xs text-muted-foreground">{readOnlyReason(access)}</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </>
  )
}

/**
 * One task, opened over the page it was clicked on: read it, change it, move
 * it, or delete it. Driven by ?task=<id>, so the same sheet opens from a card,
 * a list row, the calendar or a project, and from a link somebody sent.
 */
const TaskSheet = ({ tasks, access, userId }: TaskSheetProps) => {
  const taskId = useSearchParams().get(TASK_PARAM)
  const inView = tasks.find((task) => task.id === taskId)

  // A sent link can name a task outside this view. The caller's whole board
  // finds it, read through the same visibility rules as every other list.
  const boardQuery = useQuery({ ...tasksListQuery(), enabled: taskId !== null && !inView })
  const task = inView ?? boardQuery.data?.data.find((item) => item.id === taskId)

  const renderPlaceholder = () => {
    if (boardQuery.isError) {
      return (
        <>
          <SheetHeader>
            <SheetTitle>Task</SheetTitle>
            <SheetDescription className="sr-only">The task could not be loaded.</SheetDescription>
          </SheetHeader>
          <ErrorState
            message="The task did not load."
            onRetry={() => void boardQuery.refetch()}
            isRetrying={boardQuery.isFetching}
          />
        </>
      )
    }

    if (boardQuery.isFetching) {
      return (
        <>
          <SheetHeader>
            <SheetTitle>Opening task...</SheetTitle>
            <SheetDescription className="sr-only">Loading the task.</SheetDescription>
          </SheetHeader>
          <LoadingBlock height="h-64" />
        </>
      )
    }

    return (
      <SheetHeader>
        <SheetTitle>This task is not on your board</SheetTitle>
        <SheetDescription>
          It may have been deleted, or it belongs to work you cannot see. Ask whoever sent the link.
        </SheetDescription>
      </SheetHeader>
    )
  }

  return (
    <Sheet
      open={taskId !== null}
      onOpenChange={(open) => {
        if (!open) closeTaskSheet()
      }}
    >
      {/* Full width on a phone, where a three-quarter sheet leaves no room for a form. */}
      <SheetContent className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-lg">
        {task ? <TaskSheetBody key={task.id} task={task} access={access} userId={userId} /> : renderPlaceholder()}
      </SheetContent>
    </Sheet>
  )
}

export default TaskSheet
