"use client"

import {
  createAnnouncementAction,
  updateAnnouncementAction,
} from "@/app/(dashboardLayout)/platform/_campaignAction"
import AnnouncementComposer from "@/components/modules/Platform/AnnouncementComposer"
import AnnouncementDrafts from "@/components/modules/Platform/AnnouncementDrafts"
import PublishAnnouncementDialog from "@/components/modules/Platform/PublishAnnouncementDialog"
import RemoveAnnouncementDialog from "@/components/modules/Platform/RemoveAnnouncementDialog"
import SentAnnouncements from "@/components/modules/Platform/SentAnnouncements"
import ErrorState from "@/components/shared/state/ErrorState"
import { useActionMutation } from "@/hooks/useActionMutation"
import type { IAnnouncement } from "@/types/platform.types"
import type { IAnnouncementFormValues } from "@/zod/platform.validation"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { announcementsQuery } from "@/queries/platform.queries"
import { queryKeys } from "@/lib/queryKeys"

/**
 * Writing to customers.
 *
 * Two things this screen has to keep honest.
 *
 * **Publishing cannot be undone**, so it is a separate, confirmed action rather
 * than a checkbox on a form that saves as you type. The confirmation names the
 * audience, because "all customers" and "trials only" are one click apart and
 * the wrong one cannot be recalled.
 *
 * **It reports what happened to the email, not what was requested.** A send
 * that reached four of forty addresses says so. An operator told "sent" who
 * later finds nobody got it has been misled by their own tool.
 */

const emptyDraft: IAnnouncementFormValues = { title: "", body: "", audience: "all", send_email: false }

const CampaignBoard = () => {
  const [draft, setDraft] = useState(emptyDraft)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [confirming, setConfirming] = useState<IAnnouncement | null>(null)
  const [removing, setRemoving] = useState<IAnnouncement | null>(null)

  const announcementsList = useQuery(announcementsQuery())

  const announcements = announcementsList.data?.data ?? []
  const drafts = announcements.filter((row) => !row.published_at)
  const sent = announcements.filter((row) => row.published_at)

  const reset = () => {
    setDraft(emptyDraft)
    setEditingId(null)
  }

  const { run: saveDraft, isPending: isSaving } = useActionMutation({
    action: (values: IAnnouncementFormValues) =>
      editingId ? updateAnnouncementAction(editingId, values) : createAnnouncementAction(values),
    successMessage: editingId ? "Draft updated" : "Saved as a draft — nobody sees it yet",
    invalidateKeys: [queryKeys.platformAnnouncements.all],
    refresh: false,
  })

  const handleSave = async () => {
    if (await saveDraft(draft)) reset()
  }

  const handleEdit = (row: IAnnouncement) => {
    setEditingId(row.id)
    setDraft({ title: row.title, body: row.body, audience: row.audience, send_email: row.send_email })
  }

  const handleRemoved = (id: string) => {
    if (id === editingId) reset()
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      <AnnouncementComposer
        draft={draft}
        onChange={setDraft}
        isEditing={Boolean(editingId)}
        isSaving={isSaving}
        onSave={() => void handleSave()}
        onStopEditing={reset}
      />

      {announcementsList.isError ? (
        // Both lists read this one request, so one failure stands in for both.
        <ErrorState
          className="h-fit rounded-xl border border-dashed"
          message="The announcements did not load."
          onRetry={() => void announcementsList.refetch()}
          isRetrying={announcementsList.isFetching}
        />
      ) : (
        <div className="space-y-4">
          <AnnouncementDrafts
            drafts={drafts}
            onEdit={handleEdit}
            onPublish={setConfirming}
            onRemove={setRemoving}
          />

          <SentAnnouncements
            sent={sent}
            isLoading={announcementsList.isLoading}
            onRemove={setRemoving}
          />
        </div>
      )}

      <PublishAnnouncementDialog announcement={confirming} onClose={() => setConfirming(null)} />

      <RemoveAnnouncementDialog
        announcement={removing}
        onClose={() => setRemoving(null)}
        onRemoved={handleRemoved}
      />
    </div>
  )
}

export default CampaignBoard
