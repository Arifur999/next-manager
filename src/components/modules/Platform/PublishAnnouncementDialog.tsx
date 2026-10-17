"use client"

import { publishAnnouncementAction } from "@/app/(dashboardLayout)/platform/_campaignAction"
import { AUDIENCE_LABEL } from "@/components/modules/Platform/announcementAudience"
import ConfirmDialog from "@/components/shared/dialog/ConfirmDialog"
import { useActionMutation } from "@/hooks/useActionMutation"
import { queryKeys } from "@/lib/queryKeys"
import type { IAnnouncement } from "@/types/platform.types"
import { toast } from "sonner"

type PublishAnnouncementDialogProps = {
  announcement: IAnnouncement | null
  onClose: () => void
}

// The one step that cannot be undone, so it names the audience before it sends.
const PublishAnnouncementDialog = ({ announcement, onClose }: PublishAnnouncementDialogProps) => {
  const { run: publish, isPending } = useActionMutation({
    action: publishAnnouncementAction,
    // The server phrases its message against what actually happened to the
    // email; a failed send gets the reason rather than a success tick.
    successMessage: false,
    invalidateKeys: [queryKeys.platformAnnouncements.all],
    refresh: false,
    onSuccess: (result) => {
      if (!result.success) return

      const email = result.data.email
      if (email && email.delivered < email.attempted) {
        toast.warning(result.message, { description: email.reason ?? undefined })
      } else {
        toast.success(result.message)
      }
    },
  })

  // The dialog stays open until the send settles, so a refusal is read in place.
  const handlePublish = async () => {
    if (announcement && (await publish(announcement.id))) onClose()
  }

  return (
    <ConfirmDialog
      open={Boolean(announcement)}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      title={`Send this to ${AUDIENCE_LABEL[announcement?.audience ?? "all"].toLowerCase()}?`}
      description={
        <>
          It appears in their notifications straight away
          {announcement?.send_email ? ", and is emailed to each customer's admin" : ""}. This
          cannot be undone, and the text can no longer be edited afterwards.
        </>
      }
      confirmLabel="Publish"
      pendingLabel="Publishing..."
      isPending={isPending}
      onConfirm={() => void handlePublish()}
    />
  )
}

export default PublishAnnouncementDialog
