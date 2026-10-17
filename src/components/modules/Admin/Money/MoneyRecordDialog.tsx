"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState, type ReactNode } from "react"

type MoneyRecordDialogProps = {
  title: string
  description: ReactNode
  /** The create button. Left out when a table opens the dialog to edit a row. */
  trigger?: ReactNode
  /** Given together with onOpenChange, the caller controls the dialog. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** The form; `close` is for after a successful save. */
  children: (close: () => void) => ReactNode
}

/**
 * The dialog every money form opens in, for recording a record and for
 * correcting one. The form inside unmounts on close, so the next opening
 * starts from fresh values (and today's date) without a reset.
 */
const MoneyRecordDialog = ({ title, description, trigger, open, onOpenChange, children }: MoneyRecordDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen

  const setOpen = (next: boolean) => {
    if (isControlled) onOpenChange?.(next)
    else setInternalOpen(next)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent
        className="max-h-[90vh] w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] gap-0 overflow-hidden p-0 sm:w-[calc(100vw-3rem)] sm:max-w-[calc(100vw-3rem)] lg:w-[min(88vw,36rem)] lg:max-w-[min(88vw,36rem)]"
        // Money forms are long; a stray click or Escape must not throw away what was typed.
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader className="border-b px-6 py-5 pr-14">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-5.5rem)]">
          <div className="px-6 py-5">{children(() => setOpen(false))}</div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default MoneyRecordDialog
