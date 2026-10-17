"use client"

import ConfirmDialog from "@/components/shared/dialog/ConfirmDialog"
import { useActionMutation } from "@/hooks/useActionMutation"
import { ledgerQueryKeys } from "@/queries/finance.queries"
import type { ApiResult } from "@/types/api.types"
import type { QueryKey } from "@tanstack/react-query"
import type { ReactNode } from "react"

type DeleteMoneyRecordDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The record to remove; undefined while nothing is chosen. */
  recordId: string | undefined
  title: string
  /** What moves back, and where to: see reversalCopy. */
  description: ReactNode
  action: (id: string) => Promise<ApiResult<unknown>>
  successMessage: string
  /** The record's own list; the balances and the ledger are always added. */
  invalidateKeys: QueryKey[]
}

// The API reverses a deleted record's ledger entry rather than erasing it, so
// the balance it touched moves back. The dialog stays open on a refusal, which
// is read in the toast.
const DeleteMoneyRecordDialog = ({
  open,
  onOpenChange,
  recordId,
  title,
  description,
  action,
  successMessage,
  invalidateKeys,
}: DeleteMoneyRecordDialogProps) => {
  const { run: removeRecord, isPending } = useActionMutation({
    action,
    successMessage,
    invalidateKeys: [...invalidateKeys, ...ledgerQueryKeys],
  })

  const handleConfirm = async () => {
    if (recordId && (await removeRecord(recordId))) onOpenChange(false)
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      variant="destructive"
      confirmLabel="Delete"
      pendingLabel="Deleting..."
      isPending={isPending}
      onConfirm={() => void handleConfirm()}
    />
  )
}

export default DeleteMoneyRecordDialog
