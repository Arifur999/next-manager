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
import { useActionMutation } from "@/hooks/useActionMutation"
import { type IUser } from "@/types/user.types"
import { queryKeys } from "@/lib/queryKeys"

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
  // No successMessage: the toast is the server's "User deleted successfully".
  const { run: removeMember, isPending } = useActionMutation({
    action: deleteUserAction,
    invalidateKeys: [queryKeys.users.all],
  })

  const handleConfirm = async () => {
    if (user && (await removeMember(user.id))) onOpenChange(false)
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
