"use client"

import { deleteClientAction } from "@/app/(dashboardLayout)/admin/dashboard/clients/_action"
import ConfirmDialog from "@/components/shared/dialog/ConfirmDialog"
import { useActionMutation } from "@/hooks/useActionMutation"
import { queryKeys } from "@/lib/queryKeys"
import type { IClient } from "@/types/crm.types"

type DeleteClientDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  client: IClient | null
}

const DeleteClientDialog = ({ open, onOpenChange, client }: DeleteClientDialogProps) => {
  // The server refuses a client with recorded payments and says so; that
  // message ("archive them instead") is what the failure toast shows.
  const { run: removeClient, isPending } = useActionMutation({
    action: deleteClientAction,
    successMessage: "Client deleted successfully",
    invalidateKeys: [queryKeys.clients.all],
  })

  const handleConfirm = async () => {
    if (client && (await removeClient(client.id))) onOpenChange(false)
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete this client?"
      description={
        <>
          This removes <span className="font-medium text-foreground">{client?.name}</span> from the list. A
          client with recorded payments cannot be deleted — archive them instead, so the financial history stays
          readable.
        </>
      }
      variant="destructive"
      confirmLabel="Delete"
      pendingLabel="Deleting..."
      isPending={isPending}
      onConfirm={() => void handleConfirm()}
    />
  )
}

export default DeleteClientDialog
