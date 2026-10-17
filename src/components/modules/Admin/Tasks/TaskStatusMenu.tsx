"use client"

import { statusChoices } from "@/components/modules/Admin/Tasks/statusChoices"
import { openTaskSheet } from "@/components/modules/Admin/Tasks/taskSheetUrl"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { ITask, IWorkflowStatus } from "@/types/work.types"
import { MoreHorizontal } from "lucide-react"

type TaskStatusMenuProps = {
  task: Pick<ITask, "id" | "title" | "status">
  statuses: IWorkflowStatus[]
  onMove: (statusId: string) => void
  disabled: boolean
}

/**
 * Moves a task to any column from its card, without opening it: the board has
 * no drag and drop, and the done box only knows two columns.
 */
const TaskStatusMenu = ({ task, statuses, onMove, disabled }: TaskStatusMenuProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        size="icon-sm"
        // A 44px target for a thumb below md, without widening the card.
        className="relative -my-1 shrink-0 after:absolute after:-inset-1.5 md:size-7 md:after:hidden"
        disabled={disabled}
      >
        <MoreHorizontal className="size-4" />
        <span className="sr-only">Move or open {task.title}</span>
      </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent align="end" className="w-52">
      <DropdownMenuItem onSelect={() => openTaskSheet(task.id)}>Open task</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuLabel>Move to</DropdownMenuLabel>
      <DropdownMenuRadioGroup
        value={task.status.id}
        onValueChange={(statusId) => {
          if (statusId !== task.status.id) onMove(statusId)
        }}
      >
        {statusChoices(statuses, task.status.id).map((status) => (
          <DropdownMenuRadioItem key={status.id} value={status.id} disabled={!status.is_active}>
            {status.name}
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>
)

export default TaskStatusMenu
