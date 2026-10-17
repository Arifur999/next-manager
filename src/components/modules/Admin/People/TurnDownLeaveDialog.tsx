"use client"

import ConfirmDialog from "@/components/shared/dialog/ConfirmDialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { ILeaveRequest } from "@/types/people.types"
import { useState } from "react"

const NOTE_LIMIT = 300

type TurnDownLeaveDialogProps = {
  request: ILeaveRequest | null
  onOpenChange: (open: boolean) => void
  isPending: boolean
  /** Resolves true once the server has it, so the dialog can close. */
  onConfirm: (note: string) => Promise<boolean>
}

// Turning a request down, with an optional reason the person who asked will read.
const TurnDownLeaveDialog = ({ request, onOpenChange, isPending, onConfirm }: TurnDownLeaveDialogProps) => {
  const [note, setNote] = useState("")

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open)
    if (!open) setNote("")
  }

  const handleConfirm = async () => {
    if (await onConfirm(note)) handleOpenChange(false)
  }

  return (
    <ConfirmDialog
      open={Boolean(request)}
      onOpenChange={handleOpenChange}
      title={request ? `Turn down ${request.user.full_name}'s leave?` : "Turn down this leave?"}
      description="They are told straight away, with your reason if you give one."
      variant="destructive"
      confirmLabel="Turn down"
      pendingLabel="Sending..."
      isPending={isPending}
      onConfirm={() => void handleConfirm()}
    >
      <div className="space-y-1.5">
        <Label htmlFor="leave-decision-note">Reason (optional)</Label>
        <Textarea
          id="leave-decision-note"
          rows={3}
          maxLength={NOTE_LIMIT}
          value={note}
          disabled={isPending}
          onChange={(event) => setNote(event.target.value)}
          aria-describedby="leave-decision-note-hint"
        />
        <p id="leave-decision-note-hint" className="text-xs text-muted-foreground">
          {note.length}/{NOTE_LIMIT} · e.g. the launch is that week; could it move by a few days?
        </p>
      </div>
    </ConfirmDialog>
  )
}

export default TurnDownLeaveDialog
