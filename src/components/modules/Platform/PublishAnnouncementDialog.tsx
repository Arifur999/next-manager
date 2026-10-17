"use client"

import { publishAnnouncementAction } from "@/app/(dashboardLayout)/platform/_campaignAction"
import { AUDIENCE_LABEL, audienceReach } from "@/components/modules/Platform/announcementAudience"
import { companiesText } from "@/components/modules/Platform/companiesText"
import ConfirmDialog from "@/components/shared/dialog/ConfirmDialog"
import { useActionMutation } from "@/hooks/useActionMutation"
import { queryKeys } from "@/lib/queryKeys"
import { platformOverviewQuery } from "@/queries/platform.queries"
import type { IAnnouncement } from "@/types/platform.types"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

type PublishAnnouncementDialogProps = {
  announcement: IAnnouncement | null
  onClose: () => void
}

// The one step that cannot be undone, so it says how many companies it reaches before it sends.
const PublishAnnouncementDialog = ({ announcement, onClose }: PublishAnnouncementDialogProps) => {
  // The overview's counts, read only while the dialog is open. Without them the audience is named instead.
  const overview = useQuery({ ...platformOverviewQuery(), enabled: announcement !== null })
  const companies = overview.data?.data.companies

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

  const audience = announcement?.audience ?? "all"
  const reach = companies && audienceReach(audience, companies)
  const title =
    reach === undefined ? `Send this to ${AUDIENCE_LABEL[audience].toLowerCase()}?` : `Send this to ${companiesText(reach)}?`

  return (
    <ConfirmDialog
      open={Boolean(announcement)}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      title={title}
      description={
        <>
          It appears in the notifications of {AUDIENCE_LABEL[audience].toLowerCase()} straight away
          {announcement?.send_email ? ", and each company's admin gets it by email" : ""}. Publishing cannot be undone,
          and the text cannot be edited afterwards.
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
