"use client"

import { deleteAnnouncementAction } from "@/app/(dashboardLayout)/platform/_campaignAction"
import ConfirmDialog from "@/components/shared/dialog/ConfirmDialog"
import { useActionMutation } from "@/hooks/useActionMutation"
import { queryKeys } from "@/lib/queryKeys"
import type { IAnnouncement } from "@/types/platform.types"

type RemoveAnnouncementDialogProps = {
  announcement: IAnnouncement | null
  onClose: () => void
  onRemoved: (id: string) => void
}

const RemovalNote = ({ announcement }: { announcement: IAnnouncement }) => {
  const title = <span className="font-medium text-foreground">{announcement.title}</span>

  if (!announcement.published_at) return <>{title} has not gone to anybody, so nothing else changes.</>

  return (
    <>
      {title} leaves everyone&apos;s notifications.
      {announcement.send_email && " The email that went with it cannot be recalled."}
    </>
  )
}

// Deleting a draft, or withdrawing a notice that already went out.
const RemoveAnnouncementDialog = ({ announcement, onClose, onRemoved }: RemoveAnnouncementDialogProps) => {
  const { run: removeAnnouncement, isPending } = useActionMutation({
    action: deleteAnnouncementAction,
    successMessage: "Removed — it leaves everyone's notifications too",
    invalidateKeys: [queryKeys.platformAnnouncements.all],
    refresh: false,
  })

  const handleRemove = async () => {
    if (!announcement || !(await removeAnnouncement(announcement.id))) return

    onRemoved(announcement.id)
    onClose()
  }

  const isWithdrawal = Boolean(announcement?.published_at)

  return (
    <ConfirmDialog
      open={Boolean(announcement)}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      title={isWithdrawal ? "Withdraw this announcement?" : "Delete this draft?"}
      description={announcement && <RemovalNote announcement={announcement} />}
      variant="destructive"
      confirmLabel={isWithdrawal ? "Withdraw" : "Delete"}
      pendingLabel={isWithdrawal ? "Withdrawing..." : "Deleting..."}
      isPending={isPending}
      onConfirm={() => void handleRemove()}
    />
  )
}

export default RemoveAnnouncementDialog
