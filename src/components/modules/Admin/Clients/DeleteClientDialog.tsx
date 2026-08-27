"use client"

import { deleteClientAction } from "@/app/(dashboardLayout)/admin/dashboard/clients/_action"
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
import type { IClient } from "@/types/agencio.types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

type DeleteClientDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  client: IClient | null
}

const DeleteClientDialog = ({ open, onOpenChange, client }: DeleteClientDialogProps) => {
  const queryClient = useQueryClient()
  const router = useRouter()

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (id: string) => deleteClientAction(id),
  })

  const handleConfirm = async () => {
    if (!client) return

    const result = await mutateAsync(client.id)

    if (!result.success) {
      // The server refuses when the client has recorded payments, and says so.
      // Surfacing that message is the whole point — "archive them instead" is
      // actionable in a way "delete failed" is not.
      toast.error(result.message || "Failed to delete client")
      return
    }

    toast.success(result.message || "Client deleted successfully")
    onOpenChange(false)

    void queryClient.invalidateQueries({ queryKey: ["clients"] })
    router.refresh()
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this client?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes <span className="font-medium text-foreground">{client?.name}</span> from
            the list. A client with recorded payments cannot be deleted — archive them instead, so
            the financial history stays readable.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              // Stay open until the request settles, so a refusal can be shown
              // in place rather than after the dialog has gone.
              event.preventDefault()
              void handleConfirm()
            }}
            disabled={isPending}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteClientDialog
