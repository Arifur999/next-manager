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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useActionMutation } from "@/hooks/useActionMutation"
import type { IAnnouncement, ISentAnnouncement } from "@/types/platform.types"
import type { IAnnouncementFormValues } from "@/zod/platform.validation"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { announcementsQuery } from "@/queries/platform.queries"
import { queryKeys } from "@/lib/queryKeys"

/**
 * Writing to customers. Publishing cannot be undone, so it is its own confirmed
 * step that says how many companies it reaches, and the sent list reports what
 * happened to the email rather than what was asked for.
 */

const VIEWS = { all: "Drafts and sent", drafts: "Drafts", sent: "Sent" } as const

type CampaignView = keyof typeof VIEWS

const isCampaignView = (value: string): value is CampaignView => value in VIEWS

const isSent = (row: IAnnouncement): row is ISentAnnouncement => row.published_at !== null

const emptyDraft: IAnnouncementFormValues = { title: "", body: "", audience: "all", send_email: false }

const CampaignBoard = () => {
  const [draft, setDraft] = useState(emptyDraft)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [confirming, setConfirming] = useState<IAnnouncement | null>(null)
  const [removing, setRemoving] = useState<IAnnouncement | null>(null)
  const [view, setView] = useState<CampaignView>("all")

  const announcementsList = useQuery(announcementsQuery())

  const announcements = announcementsList.data?.data ?? []
  const drafts = announcements.filter((row) => !row.published_at)
  const sent = announcements.filter(isSent)

  const reset = () => {
    setDraft(emptyDraft)
    setEditingId(null)
  }

  const { run: saveDraft, isPending: isSaving } = useActionMutation({
    action: (values: IAnnouncementFormValues) =>
      editingId ? updateAnnouncementAction(editingId, values) : createAnnouncementAction(values),
    successMessage: editingId ? "Draft updated" : "Saved as a draft. Nobody sees it yet.",
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
        // A different draft starts with no errors from the last one.
        key={editingId ?? "new"}
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="min-h-5 text-sm text-muted-foreground">
              {announcementsList.data && `${drafts.length} ${drafts.length === 1 ? "draft" : "drafts"} · ${sent.length} sent`}
            </p>
            <Select
              value={view}
              onValueChange={(value) => {
                if (isCampaignView(value)) setView(value)
              }}
            >
              <SelectTrigger className="w-40" aria-label="Show">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(VIEWS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {view !== "sent" && (
            <AnnouncementDrafts drafts={drafts} onEdit={handleEdit} onPublish={setConfirming} onRemove={setRemoving} />
          )}

          {view !== "drafts" && (
            <SentAnnouncements sent={sent} isLoading={announcementsList.isLoading} onRemove={setRemoving} />
          )}
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
