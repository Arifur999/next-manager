import type { UserRole } from "@/lib/authUtils"
import type { ITask } from "@/types/work.types"

/**
 * What somebody may do to a task, as PATCH /tasks/:id decides it: admin and
 * the project manager change anything, operations only the status and
 * description of a task that is theirs, and sales nothing (the route refuses
 * them), so the sheet never offers a control the API would turn down.
 */
export type TaskAccess = "manage" | "own" | "read"

export const taskAccessFor = (role: UserRole | null | undefined): TaskAccess => {
  if (role === "admin" || role === "project_manager") return "manage"
  if (role === "operations") return "own"
  return "read"
}

export const canEditTask = (access: TaskAccess, task: Pick<ITask, "assignee_id">, userId: string | null): boolean => {
  if (access === "manage") return true
  return access === "own" && userId !== null && task.assignee_id === userId
}
