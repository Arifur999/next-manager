import type { IWorkflowStatus } from "@/types/work.types"

// Where a task can be put: the columns that are switched on, plus the one it
// already sits in, so a picker can still show a retired column as its value.
export const statusChoices = (statuses: IWorkflowStatus[], currentId: string): IWorkflowStatus[] =>
  statuses.filter((status) => status.is_active || status.id === currentId)
