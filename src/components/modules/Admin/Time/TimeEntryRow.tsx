"use client"

import { deleteTimeAction } from "@/app/(dashboardLayout)/dashboard/timesheet/_action"
import LogTimeModal from "@/components/modules/Admin/Time/LogTimeModal"
import ConfirmDialog from "@/components/shared/dialog/ConfirmDialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useActionMutation } from "@/hooks/useActionMutation"
import { formatDayShort, formatHours, toDate } from "@/lib/dates"
import { queryKeys } from "@/lib/queryKeys"
import type { ITimeEntry } from "@/types/work.types"
import { format } from "date-fns"
import { Lock, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { useState } from "react"

/**
 * One logged entry on the caller's own timesheet. Until somebody approves it,
 * it can be corrected or removed; after that it is locked, as the API has it.
 */
const TimeEntryRow = ({ entry }: { entry: ITimeEntry }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const isApproved = entry.approved_at !== null
  const label = `${formatHours(entry.hours)} on ${entry.project?.name ?? "this project"}`

  const { run: removeEntry, isPending } = useActionMutation({
    action: deleteTimeAction,
    successMessage: "Time deleted",
    invalidateKeys: [queryKeys.timeEntries.all, queryKeys.timeSummary.all],
    refresh: false,
  })

  const confirmDelete = async () => {
    if (await removeEntry(entry.id)) setIsDeleting(false)
  }

  return (
    <li className="flex items-center justify-between gap-3 px-5 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">
          {entry.project?.name ?? "Project"}
          {entry.task ? ` · ${entry.task.title}` : ""}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {format(toDate(entry.date), "EEE")} {formatDayShort(entry.date)}
          {entry.notes ? ` · ${entry.notes}` : ""}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {!entry.is_billable && (
          <Badge variant="outline" className="text-xs">
            non-billable
          </Badge>
        )}
        {isApproved && (
          // The lock is not decoration: it says why the row has no menu.
          <span className="flex items-center gap-1 text-xs text-muted-foreground" title="Approved — no longer editable">
            <Lock className="size-3" aria-hidden="true" />
            approved
          </span>
        )}
        <span className="text-sm font-medium tabular-nums">{formatHours(entry.hours)}</span>

        {!isApproved && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                // A 44px target for a thumb below md, without widening the row.
                className="relative -my-1 after:absolute after:-inset-1.5 md:after:hidden"
                disabled={isPending}
              >
                <MoreHorizontal className="size-4" />
                <span className="sr-only">Edit or delete {label}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Pencil aria-hidden="true" className="size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => setIsDeleting(true)}>
                <Trash2 aria-hidden="true" className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {!isApproved && (
        <>
          <LogTimeModal defaultDate={entry.date} entry={entry} open={isEditing} onOpenChange={setIsEditing} />
          <ConfirmDialog
            open={isDeleting}
            onOpenChange={setIsDeleting}
            title="Delete this time?"
            description={<>{label} comes off your week and out of the billable share.</>}
            variant="destructive"
            confirmLabel="Delete time"
            pendingLabel="Deleting..."
            isPending={isPending}
            onConfirm={() => void confirmDelete()}
          />
        </>
      )}
    </li>
  )
}

export default TimeEntryRow
