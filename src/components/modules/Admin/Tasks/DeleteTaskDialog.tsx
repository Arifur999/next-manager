"use client"

import { deleteTaskAction } from "@/app/(dashboardLayout)/admin/dashboard/tasks/_action"
import { closeTaskSheet } from "@/components/modules/Admin/Tasks/taskSheetUrl"
import ConfirmDialog from "@/components/shared/dialog/ConfirmDialog"
import { Button } from "@/components/ui/button"
import { useActionMutation } from "@/hooks/useActionMutation"
import { queryKeys } from "@/lib/queryKeys"
import type { ITask } from "@/types/work.types"
import { Trash2 } from "lucide-react"
import { useState } from "react"

/** The Delete button in a task's sheet, and the confirmation behind it. */
const DeleteTaskDialog = ({ task }: { task: Pick<ITask, "id" | "title"> }) => {
  const [open, setOpen] = useState(false)

  const { run: removeTask, isPending } = useActionMutation({
    // The sheet closes as soon as the server agrees, before the lists refetch:
    // once they do, the task is gone and the sheet would have nothing to show.
    action: async (id: string) => {
      const result = await deleteTaskAction(id)
      if (result.success) closeTaskSheet()
      return result
    },
    successMessage: "Task deleted",
    invalidateKeys: [queryKeys.tasks.all, queryKeys.taskReport.all, queryKeys.dashboard.all],
    refresh: false,
  })

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        className="text-destructive hover:bg-destructive-subtle hover:text-destructive-subtle-foreground"
        onClick={() => setOpen(true)}
      >
        <Trash2 aria-hidden="true" className="size-4" />
        Delete
      </Button>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete this task?"
        description={
          <>
            <span className="font-medium text-foreground">{task.title}</span> leaves the board and every view of it.
            Time already logged against it stays on the timesheets.
          </>
        }
        variant="destructive"
        confirmLabel="Delete task"
        pendingLabel="Deleting..."
        isPending={isPending}
        onConfirm={() => void removeTask(task.id)}
      />
    </>
  )
}

export default DeleteTaskDialog
