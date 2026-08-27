"use client"

import { deleteUserAction } from "@/app/(dashboardLayout)/admin/dashboard/team-management/_action"
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
import { type IUser } from "@/types/user.types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

type DeleteUserConfirmationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: IUser | null
}

const DeleteUserConfirmationDialog = ({
  open,
  onOpenChange,
  user,
}: DeleteUserConfirmationDialogProps) => {
  const queryClient = useQueryClient()
  const router = useRouter()

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (id: string) => deleteUserAction(id),
  })

  const handleConfirm = async () => {
    if (!user) return

    const result = await mutateAsync(user.id)

    if (!result.success) {
      toast.error(result.message || "Failed to delete team member")
      return
    }

    toast.success(result.message || "Team member deleted successfully")
    onOpenChange(false)

    // invalidate for the client cache, refresh for the server-rendered part.
    void queryClient.invalidateQueries({ queryKey: ["users"] })
    router.refresh()
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove this team member?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove{" "}
            <span className="font-medium text-foreground">{user?.full_name}</span> from the
            workspace and end their access immediately. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              // Keep the dialog open until the request settles, so a failure can
              // be shown in place rather than after it has already closed.
              event.preventDefault()
              void handleConfirm()
            }}
            disabled={isPending}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {isPending ? "Removing..." : "Remove"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteUserConfirmationDialog
