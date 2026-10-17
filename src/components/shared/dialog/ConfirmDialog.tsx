"use client"

import Loader from "@/components/shared/Loader"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: React.ReactNode
  onConfirm: () => void
  confirmLabel?: string
  pendingLabel?: string
  variant?: "default" | "destructive"
  isPending?: boolean
  // Extra content between the description and the buttons.
  children?: React.ReactNode
}

// The confirmation step for anything destructive. It stays open, with a
// spinner, until the action settles: the caller closes it on success, so a
// refusal from the server is read in place.
const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmLabel = "Confirm",
  pendingLabel = "Working...",
  variant = "default",
  isPending = false,
  children,
}: ConfirmDialogProps) => {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        // Escape and Cancel must not abandon a request that is in flight.
        if (!isPending) onOpenChange(nextOpen)
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        {children}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant={variant}
            disabled={isPending}
            onClick={(event) => {
              // Radix would close the dialog before the action resolves.
              event.preventDefault()
              onConfirm()
            }}
          >
            {isPending && <Loader size={14} label={pendingLabel} />}
            {isPending ? pendingLabel : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default ConfirmDialog
