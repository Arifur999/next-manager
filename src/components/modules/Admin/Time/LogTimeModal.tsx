"use client"

import LogTimeForm from "@/components/modules/Admin/Time/LogTimeForm"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ITimeEntry } from "@/types/work.types"
import { Plus } from "lucide-react"
import { useState } from "react"

type LogTimeModalProps = {
  defaultDate: string
  /** Present to edit an entry; the timesheet then drives `open` itself. */
  entry?: ITimeEntry | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

/**
 * One modal for logging time and for correcting it. Uncontrolled with its own
 * button when logging; controlled by the timesheet row when editing.
 */
const LogTimeModal = ({ defaultDate, entry, open, onOpenChange }: LogTimeModalProps) => {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen

  const setOpen = (next: boolean) => {
    if (isControlled) onOpenChange?.(next)
    else setInternalOpen(next)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button type="button">
            <Plus className="size-4" />
            Log time
          </Button>
        </DialogTrigger>
      )}

      <DialogContent
        className="max-h-[90vh] overflow-hidden p-0"
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader className="border-b px-6 py-5 pr-14">
          <DialogTitle>{entry ? "Edit time" : "Log time"}</DialogTitle>
          <DialogDescription>
            {entry
              ? "Correct it while it waits for approval. Once approved it is locked."
              : "Log the non-billable hours too — without them the utilization figure is measured against a number nobody wrote down."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-5.5rem)]">
          <div className="px-6 py-5">
            {/* The dialog unmounts its content when closed, and the key
                remounts it per entry, so every opening starts from that
                entry's values (or a blank form), not the last ones typed. */}
            <LogTimeForm key={entry?.id ?? "new"} entry={entry} defaultDate={defaultDate} onDone={() => setOpen(false)} />

          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default LogTimeModal
