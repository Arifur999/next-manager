"use client"

import { deleteUserAction } from "@/app/(dashboardLayout)/admin/dashboard/team-management/_action"
import ConfirmDialog from "@/components/shared/dialog/ConfirmDialog"
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
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Remove this team member?"
      description={
        <>
          This will remove <span className="font-medium text-foreground">{user?.full_name}</span> from the
          workspace and end their access immediately. This action cannot be undone.
        </>
      }
      variant="destructive"
      confirmLabel="Remove"
      pendingLabel="Removing..."
      isPending={isPending}
      onConfirm={() => void handleConfirm()}
    />
  )
}

export default DeleteUserConfirmationDialog
