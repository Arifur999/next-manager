"use client"

import { deleteCredentialAction } from "@/app/(dashboardLayout)/admin/dashboard/vault/_action"
import CredentialFormModal from "@/components/modules/Admin/Vault/CredentialFormModal"
import ConfirmDialog from "@/components/shared/dialog/ConfirmDialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useActionMutation } from "@/hooks/useActionMutation"
import { queryKeys } from "@/lib/queryKeys"
import type { ICredential } from "@/types/workspace.types"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { useState } from "react"

type CredentialActionsProps = {
  credential: ICredential
  /** Admin, sales and project managers; the API still checks the vault edit square. */
  canEdit: boolean
  /** Admin only, as at the API. */
  canDelete: boolean
}

// Edit and Delete for one credential, behind a menu so the card keeps Reveal as its main action.
const CredentialActions = ({ credential, canEdit, canDelete }: CredentialActionsProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const { run: removeCredential, isPending } = useActionMutation({
    action: deleteCredentialAction,
    successMessage: "Credential deleted",
    invalidateKeys: [queryKeys.credentials.all],
    refresh: false,
  })

  if (!canEdit && !canDelete) return null

  const handleDelete = async () => {
    if (await removeCredential(credential.id)) setIsDeleting(false)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="ghost" size="icon" className="shrink-0">
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Actions for {credential.label}</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          {canEdit && (
            <DropdownMenuItem onSelect={() => setIsEditing(true)}>
              <Pencil />
              Edit or rotate password
            </DropdownMenuItem>
          )}
          {canDelete && (
            <DropdownMenuItem variant="destructive" onSelect={() => setIsDeleting(true)}>
              <Trash2 />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {canEdit && (
        <CredentialFormModal credential={credential} open={isEditing} onOpenChange={setIsEditing} />
      )}

      <ConfirmDialog
        open={isDeleting}
        onOpenChange={setIsDeleting}
        title={`Delete ${credential.label}?`}
        description="It leaves the vault for everybody. Its access log is kept, so who saw it before it was removed can still be answered."
        variant="destructive"
        confirmLabel="Delete"
        pendingLabel="Deleting..."
        isPending={isPending}
        onConfirm={() => void handleDelete()}
      />
    </>
  )
}

export default CredentialActions
